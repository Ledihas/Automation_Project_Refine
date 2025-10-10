import { Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export const UsersShow = () => {
  const { result: record, query } = useShow({
    resource: "users",
  });
  const { isLoading } = query;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"userId"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"name"}</Title>
      <TextField value={record?.Nombre} />
      <Title level={5}>{"email"}</Title>
      <TextField value={record?.Email} />
      <Title level={5}>{"phone"}</Title>
      <TextField value={record?.Teléfono} />
    </Show>
  );
};
