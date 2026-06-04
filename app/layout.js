import "./globals.css";

export const metadata = {
  title: "Cisco IOS 명령어 연습기 - 패킷 트레이서",
  description: "정보기기운용기능사 및 네트워크 실습을 위한 인터랙티브 Cisco IOS 명령어 시뮬레이터",
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
