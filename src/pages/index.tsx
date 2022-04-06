import { GetStaticProps } from 'next';
import { useState } from 'react';

import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { ptBR } from 'date-fns/locale';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Spacing from '../components/Spacing/Spacing';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({
  postsPagination: { results, next_page },
}: HomeProps): JSX.Element {
  const [newPosts, setNewPosts] = useState(results);
  const [hasMorePosts, setHasMorePosts] = useState(Boolean(next_page));

  const onFetchMorePosts = async (): Promise<void> => {
    try {
      const response = await fetch(next_page);
      // if (!response.ok) {
      //   console.error(`An error has occured: ${response.status}`);
      // }
      const posts = await response.json();
      setNewPosts([...newPosts, ...posts.results]);
      setHasMorePosts(Boolean(posts.next_page));
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <main className={commonStyles.container}>
      {newPosts.map(({ uid, data, first_publication_date }) => (
        <section key={uid} className={styles.postCard}>
          <h1>
            <Link href={`/post/${uid}`}>
              <a className={commonStyles.action}>{data.title}</a>
            </Link>
          </h1>
          <Spacing />

          <h2>{data.subtitle}</h2>
          <Spacing size={24} />

          <div className={styles.footer}>
            <div>
              <FiCalendar size={20} />
              <time>
                {format(new Date(first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
            </div>

            <Spacing direction="horizontal" size={24} />

            <div>
              <FiUser size={20} />
              <span>{data.author}</span>
            </div>
          </div>
        </section>
      ))}
      <Spacing direction="vertical" size={64} />
      {hasMorePosts && (
        <button
          onClick={onFetchMorePosts}
          type="button"
          className={[styles.loadMorePosts, commonStyles.action].join(' ')}
        >
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  return {
    props: {
      postsPagination: postsResponse,
    },
    revalidate: 60 * 30,
  };
};
