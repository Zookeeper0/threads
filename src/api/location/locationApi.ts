import { request } from "@/lib/api";

export const locationSearchName = async (variables: {
  latitude: number;
  longitude: number;
}) => {
  console.log("locationSearchName 호출됨, variables:", variables);

  const requestData = {
    url: "/location/search/name",
    method: "POST",
    data: variables,
  };

  console.log("request 데이터:", requestData);

  const response = await request(requestData);
  console.log("API 응답:", response);

  return response;
};
