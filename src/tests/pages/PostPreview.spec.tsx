import { render, screen } from '@testing-library/react';
import { useSession, getSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';

jest.mock('../../services/prismic.ts');

jest.mock('next-auth/client');

jest.mock('next/router');

const post = {
    slug: 'my-new-post', 
    title: 'My New Post', 
    content: '<p>Post content</p>', 
    updatedAt: 'March, 10'
  };

describe('Post preview page', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession);
    
    useSessionMocked.mockReturnValueOnce([ null, false])

    render(
      <Post
        post={post} 
      />
    )
    
    expect(screen.getByText("My New Post")).toBeInTheDocument()
    expect(screen.getByText("Post content")).toBeInTheDocument()
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument()
  });

  it('redirects user to full post when authenticated', async () => {
    const getSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();

    getSessionMocked.mockReturnValueOnce([{
      activeSubscription: 'fake-active-subscription'
    }] as any);

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any)

    render(
      <Post
        post={post} 
      />
    )

    expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')
  });
  
  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);
    
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'My new post'}
          ],
          content: [
            { type: 'paragraph', text: 'Post content' }
          ],
        },
        last_publication_date: '06-16-2021',
      })
    } as any)
       
    const response = await getStaticProps({
      params: {slug: 'my-new-post'}
    });
  
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My new post',
            content: '<p>Post content</p>',
            updatedAt: '16 de junho de 2021' 
          }
        }
      })
    )
  });
})