import { render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import Posts, { getStaticProps } from '../../pages/posts';
import { getPrismicClient } from '../../services/prismic';

jest.mock('../../services/prismic.ts');

const posts = [
  {
    slug: 'my-new-post', 
    title: 'My New Post', 
    excerpt: 'Post excerpt', 
    updatedAt: 'March, 10'
  }
]

describe('Posts page', () => {
  it('renders correctly', () => {
    render(
      <Posts
        posts={posts}  
      />
    )
    
    expect(screen.getByText("My New Post")).toBeInTheDocument()
    expect(screen.getByText("Post excerpt")).toBeInTheDocument()
  });

  it('load inital data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-new-post',
            data: {
              title: [
                { type: 'heading', text: 'My New Post'}
              ],
              content: [
                { type: 'paragraph', text: 'Post excerpt'}
              ],
            },
            last_publication_date: '06-16-2021',
          }
        ]
      })
    } as any);
    
    const response = await getStaticProps({});
    
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: 'my-new-post',
              title: 'My New Post',
              excerpt: 'Post excerpt',
              updatedAt: '16 de junho de 2021'
            }
          ]
        }
      })
    )
  });
})