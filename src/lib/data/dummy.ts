interface RecentMemory {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
}
export const recentMemories: RecentMemory[] = [
  {
    id: "1",
    title: "슈퍼 잼민이",
    date: "3일 전",
    imageUrl:
      "http://localhost:3845/assets/9b8974a5e686ef8741ef4f404e037c71632b80a3.png",
  },
  {
    id: "2",
    title: "해달 생일 🎂",
    date: "3일 전",
    imageUrl:
      "http://localhost:3845/assets/82db08c3a962ddb03457b9f6dcc8c17bb49699fe.png",
  },
  {
    id: "3",
    title: "청도 글램핑",
    date: "2주 전",
    imageUrl:
      "http://localhost:3845/assets/e4b7d81d22483211645f93f117300e35f95858ce.png",
  },
  {
    id: "4",
    title: "한강 산책면",
    date: "한달전",
    imageUrl:
      "http://localhost:3845/assets/73b38b2f9233fe14405af7d470c20bf9e76485a6.png",
  },
];
