import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import {Async} from '.'

test('it renders correctly',  async () => {
  render(<Async />)

  expect(screen.getByText('Hello World')).toBeInTheDocument()

  //1º-Método
  // expect(await screen.findByText('Click me')).toBeInTheDocument()

  //2º-Método
  await waitFor(() => {
    return expect(screen.getByText('Click me')).toBeInTheDocument()
    //invisible
    //return expect(screen.queryByText('Click me')).not.toBeInTheDocument()
  }, {
    timeout: 3000
  })

  //invisible -> element can't show in screen
  // waitForElementToBeRemoved(screen.queryByText('Click me'))
});