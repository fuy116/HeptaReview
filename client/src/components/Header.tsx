import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface HeaderProps {
  onAddCard: () => void;
  onAddSubject?: () => void;
}

export default function Header({ onAddCard, onAddSubject }: HeaderProps) {
  const [location] = useLocation();

  let actionButton = null;
  if (location === "/cards") {
    actionButton = (
      <Button onClick={onAddCard}>
        <PlusIcon className="h-4 w-4 mr-1" /> 新增卡片
      </Button>
    );
  } else if (location === "/subjects" && onAddSubject) {
    actionButton = (
      <Button onClick={onAddSubject}>
        <PlusIcon className="h-4 w-4 mr-1" /> 新增科目
      </Button>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <nav className="flex space-x-4">
              <Link href="/">
                <a className={`px-3 py-2 text-sm font-medium ${
                  location === "/" 
                    ? "text-primary-600 border-b-2 border-primary-500" 
                    : "text-gray-600 hover:text-primary-600"
                }`}>
                  首頁
                </a>
              </Link>
              <Link href="/cards">
                <a className={`px-3 py-2 text-sm font-medium ${
                  location === "/cards" 
                    ? "text-primary-600 border-b-2 border-primary-500" 
                    : "text-gray-600 hover:text-primary-600"
                }`}>
                  卡片管理
                </a>
              </Link>
              <Link href="/subjects">
                <a className={`px-3 py-2 text-sm font-medium ${
                  location === "/subjects" 
                    ? "text-primary-600 border-b-2 border-primary-500" 
                    : "text-gray-600 hover:text-primary-600"
                }`}>
                  科目管理
                </a>
              </Link>
            </nav>
          </div>
          <div>
            {actionButton}
          </div>
        </div>
      </div>
    </header>
  );
}
