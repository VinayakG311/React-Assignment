
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { RESTDataSource } from "@apollo/datasource-rest";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";


class Data extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://ckan.indiadataportal.com/api/3/action/datastore_search?limit=10000&resource_id=c0f168be-3532-4d08-b908-473ded89bd8b";
  }
  async getData() {
    return this.get('result');
  }

}
interface ContextValue {
  datasource: {
    DataAPI: Data
  }
}
const typeDefs = gql`
  type Record {
    holding_num: Float
    holding_area: Float
  }

  type result {
    records: [Record]
  }

  type Query {
    getHoldingData: result
  }
`;

const resolvers = {
  Query: {
    fetchdata: (_: any, __: any, { datasource }: any) => { return datasource.DataAPI.getData(); }

  }
}


// Provide resolvers to fetch data from your JSON source


const httpLink = new HttpLink({
  uri: "https://ckan.indiadataportal.com/api/3/action/datastore_search?limit=10000&resource_id=c0f168be-3532-4d08-b908-473ded89bd8b",
});
export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  typeDefs,
  resolvers
});
