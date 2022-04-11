/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { Fragment } from 'react';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Spacing from '../../components/Spacing/Spacing';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

const AVERAGE_HUMAN_READING_WORDS_PER_MINUTE = 200;
const readingTime = (words: number): number =>
  Math.ceil(words / AVERAGE_HUMAN_READING_WORDS_PER_MINUTE);

export default function Post({ post }: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <p>Carregando...</p>;
  }

  const wordsCount = post.data.content.reduce((acc, content) => {
    const bodyWords = content.body.reduce(
      (totalBodyWords, word) => totalBodyWords + word.text.split(' ').length,
      0
    );
    const headingWords = content.heading.split(' ').length;
    return acc + bodyWords + headingWords;
  }, 0);
  const time = `${readingTime(wordsCount)} min`;

  const newBody = post.data.content.map(content => ({
    heading: content.heading,
    body: {
      text: RichText.asHtml(content.body),
    },
  }));

  return (
    <main className={commonStyles.container}>
      <article>
        <section
          className={styles.bannerContainer}
          style={{ background: `url(${post.data.banner.url})` }}
        />

        <Spacing size={80} />

        <section className={styles.content}>
          <h1 className={styles.title}>{post.data.title}</h1>
          <Spacing size={25} />
          <div className={styles.postInfo}>
            <div>
              <FiCalendar size={20} />
              <time>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
            </div>

            <div>
              <FiUser size={20} />
              <span>{post.data.author}</span>
            </div>

            <div>
              <FiClock size={20} />
              <span>{time}</span>
            </div>
          </div>

          <Spacing size={64} />

          <div className={styles.contentSection}>
            {newBody.map((section, i) => (
              <Fragment key={`${section}-${i}`}>
                <h2>{section.heading}</h2>
                <Spacing size={50} />
                <div dangerouslySetInnerHTML={{ __html: section.body.text }} />
              </Fragment>
            ))}
          </div>
        </section>

        <Spacing size={80} />
      </article>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  return {
    fallback: true,
    paths: posts.results.map(p => ({ params: { slug: p.uid } })),
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const {
    params: { slug },
  } = context;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 30,
  };
};
