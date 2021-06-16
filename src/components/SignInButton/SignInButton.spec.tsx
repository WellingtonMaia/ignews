import { render, screen } from '@testing-library/react';
import { SignInButton } from '.';
import { mocked } from 'ts-jest/utils';
import { useSession } from 'next-auth/client';

jest.mock('next-auth/client')

describe('ActiveLink component', () => {
  it('renders corretly when user is not authenticated', () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    render( <SignInButton /> );
    
    expect(screen.getByText('Sing in with Github')).toBeInTheDocument()
  });

  it('renders corretly when user is authenticated', () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValue([{
      user: {
        name: 'John Doe',
        email: 'john.doe@outlook.com'
      },
      expires: 'fake-expires'
    }, true])
    render( <SignInButton /> );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  });
});