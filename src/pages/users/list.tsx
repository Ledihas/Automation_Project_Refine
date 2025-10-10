import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table } from "antd";
const sdk = require('node-appwrite');

export const UserList = () => {
  const { tableProps } = useTable({
      resource: "users",
    syncWithLocation: true,
  });

  const client = new sdk.Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') 
    .setProject('68e0498c003576d90735') 
    .setKey('standard_326c2533604959be6c6680fdcca9088b3b904f549a5390680f5e550a3e29bdb080aab0d576e15d23341c88458044e2e125eff1f41375aa8ef28b13bfacfca8fcee533e8bc639038a0fd5948a8636567e70d36290b96062c9586d0aa55562ec32f659aaa1d69b281679c8390505c7ca8f90058adf40499e004c6da039bafb520a'); 

  const users = new sdk.Users(client);

  const result = users.list({
      
  });

  return result;
};
