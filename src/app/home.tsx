import { Redirect } from "expo-router";


// Home => "/" 페이지
export default function Home() {
  return <Redirect href="/(tabs)" />;
}
