'use client'

import Home from './page'
import { ApolloProvider } from '@apollo/client'
import { client } from './Client'

// export default function RootLayout() {
//   return (
//     <ApolloProvider client={client}>
//       <Home></Home>
//     </ApolloProvider>

//   )
// }

export default function RootLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">

      <body>
        <ApolloProvider client={client}>
          <Home />
        </ApolloProvider>

      </body>


    </html>
  );
}