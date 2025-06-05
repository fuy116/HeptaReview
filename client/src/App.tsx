import { Switch, Route, useLocation } from "wouter";
import Dashboard from "@/pages/Dashboard";
import CardManagement from "@/pages/CardManagement";
import SubjectManagement from "@/pages/SubjectManagement";
import Header from "@/components/Header";
import NotFound from "@/pages/not-found";
import { useState, useCallback, useEffect } from "react";
import AddCardModal from "@/components/AddCardModal";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { insertSubjectSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReviewHistoryPage from "@/pages/ReviewHistoryPage";

function App() {
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [location] = useLocation();

  const openAddCardModal = useCallback(() => setIsAddCardModalOpen(true), []);
  const closeAddCardModal = useCallback(() => setIsAddCardModalOpen(false), []);
  const openAddSubjectModal = useCallback(() => setIsAddSubjectModalOpen(true), []);
  const closeAddSubjectModal = useCallback(() => setIsAddSubjectModalOpen(false), []);

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

  // 新增科目表單
  const { toast } = useToast();
  const addSubjectSchema = insertSubjectSchema.extend({
    name: z.string().min(1, "科目名稱不能為空"),
  });
  const form = useForm({
    resolver: zodResolver(addSubjectSchema),
    defaultValues: { name: "" },
  });
  const createSubjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addSubjectSchema>) => {
      const response = await apiRequest('POST', '/api/subjects', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      toast({
        title: "科目已新增",
        description: "科目已成功新增",
      });
      closeAddSubjectModal();
      form.reset();
    },
    onError: () => {
      toast({
        title: "新增失敗",
        description: "新增科目時發生錯誤",
        variant: "destructive",
      });
    }
  });
  const onSubmit = (data: z.infer<typeof addSubjectSchema>) => {
    createSubjectMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onAddCard={openAddCardModal} onAddSubject={openAddSubjectModal} />
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
        <Route path="/cards/:id/history">
          <ReviewHistoryPage />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
      <AddCardModal isOpen={isAddCardModalOpen} onClose={closeAddCardModal} />
      {/* 新增科目 Modal */}
      <Dialog open={isAddSubjectModalOpen} onOpenChange={closeAddSubjectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增科目</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                {...form.register("name")}
                placeholder="輸入科目名稱"
                disabled={createSubjectMutation.isPending}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeAddSubjectModal}>
                取消
              </Button>
              <Button type="submit" disabled={createSubjectMutation.isPending}>
                {createSubjectMutation.isPending ? "新增中..." : "新增"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
