import { GetStaticProps } from 'next';
import { useState } from 'react';

import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
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

const normalizePostResponse = (posts: ApiSearchResponse): PostPagination => ({
  next_page: posts.next_page,
  results: posts.results.map(post => ({
    uid: post.uid,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy'
    ),
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  })),
});

export default function Home({
  postsPagination: { results, next_page },
}: HomeProps): JSX.Element {
  const [newPosts, setNewPosts] = useState(results);
  const [hasMorePosts, setHasMorePosts] = useState(Boolean(next_page));

  const onFetchMorePosts = async (): Promise<void> => {
    try {
      const response = await fetch(next_page);
      if (!response.ok) {
        throw new Error(`An error has occured: ${response.status}`);
      }
      const posts: ApiSearchResponse = await response.json();
      const normalizedPosts = normalizePostResponse(posts);
      setNewPosts([...newPosts, ...normalizedPosts.results]);
      setHasMorePosts(Boolean(posts.next_page));
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return (
    <main className={commonStyles.container}>
      {newPosts.map(({ uid, data, first_publication_date }) => (
        <section key={uid} className={styles.postCard}>
          <h1>
            <Link href={uid}>
              <a className={commonStyles.action}>{data.title}</a>
            </Link>
          </h1>
          <Spacing />

          <h2>{data.subtitle}</h2>
          <Spacing size={24} />

          <div className={styles.footer}>
            <div>
              <FiCalendar size={20} />
              <time>{first_publication_date}</time>
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
      postsPagination: normalizePostResponse(postsResponse),
    },
  };
};
