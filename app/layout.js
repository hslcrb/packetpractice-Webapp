import "./globals.css";

export const metadata = {
  title: "정보기기 연습",
  description: "정보기기운용기능사 실기 대비 Cisco IOS 명령어 시뮬레이터",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
