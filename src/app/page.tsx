import { Header } from "@/components/common/header";

export default function Home() {
  return (
    <div>
      <Header />
      {/* Separator */}
      <div className="mt-15"></div>
      <div className="mt-200 w-full flex justify-center h-[200px] items-center bg-gray-200">
        <h2>Welcome to Cold Breeze</h2>
      </div>
    </div>
  );
}
