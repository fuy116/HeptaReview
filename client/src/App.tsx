import { Switch, Route } from "wouter";
import Dashboard from "@/pages/Dashboard";
import CardManagement from "@/pages/CardManagement";
import SubjectManagement from "@/pages/SubjectManagement";
import Header from "@/components/Header";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import AddCardModal from "@/components/AddCardModal";

function App() {
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  const openAddCardModal = () => setIsAddCardModalOpen(true);
  const closeAddCardModal = () => setIsAddCardModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onAddCard={openAddCardModal} />
      
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/cards">
          {() => <CardManagement onAddCard={openAddCardModal} />}
        </Route>
        <Route path="/subjects">
          {() => <SubjectManagement />}
        </Route>
        <Route component={NotFound} />
      </Switch>

      <AddCardModal isOpen={isAddCardModalOpen} onClose={closeAddCardModal} />
    </div>
  );
}

export default App;
