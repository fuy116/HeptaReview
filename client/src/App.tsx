import { Switch, Route, useLocation } from "wouter";
import Dashboard from "@/pages/Dashboard";
import CardManagement from "@/pages/CardManagement";
import SubjectManagement from "@/pages/SubjectManagement";
import Header from "@/components/Header";
import NotFound from "@/pages/not-found";
import { useState, useCallback, useEffect } from "react";
import AddCardModal from "@/components/AddCardModal";
import { queryClient } from "@/lib/queryClient";

function App() {
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [location] = useLocation();

  const openAddCardModal = useCallback(() => setIsAddCardModalOpen(true), []);
  const closeAddCardModal = useCallback(() => setIsAddCardModalOpen(false), []);

  // 當路由變化時，確保 React Query 的緩存被正確處理
  useEffect(() => {
    // 強制重新獲取當前頁面需要的數據
    if (location === "/") {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/today"] });
    } else if (location === "/cards") {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
    } else if (location === "/subjects") {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onAddCard={openAddCardModal} />
      
      <Switch>
        <Route path="/">
          <Dashboard />
        </Route>
        <Route path="/cards">
          <CardManagement onAddCard={openAddCardModal} />
        </Route>
        <Route path="/subjects">
          <SubjectManagement />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>

      <AddCardModal isOpen={isAddCardModalOpen} onClose={closeAddCardModal} />
    </div>
  );
}

export default App;
