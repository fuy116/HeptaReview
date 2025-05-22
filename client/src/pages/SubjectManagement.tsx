import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { BookOpenIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSubjectSchema } from "@shared/schema";
import { z } from "zod";

export default function SubjectManagement() {
  const { toast } = useToast();
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<{ id: number, name: string } | null>(null);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['/api/subjects'],
  });

  const addSubjectSchema = insertSubjectSchema.extend({
    name: z.string().min(1, "科目名稱不能為空"),
  });

  const form = useForm({
    resolver: zodResolver(addSubjectSchema),
    defaultValues: {
      name: "",
    },
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
      setIsAddSubjectModalOpen(false);
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

  const deleteSubjectMutation = useMutation({
    mutationFn: async (subjectId: number) => {
      await apiRequest('DELETE', `/api/subjects/${subjectId}`);
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/subject-distribution'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.refetchQueries({ queryKey: ['/api/subjects'] });
      queryClient.refetchQueries({ queryKey: ['/api/stats/subject-distribution'] });
      toast({
        title: "科目已刪除",
        description: "科目已成功刪除",
      });
      setIsDeleteConfirmationOpen(false);
      setSubjectToDelete(null);
    },
    onError: () => {
      toast({
        title: "刪除失敗",
        description: "刪除科目時發生錯誤",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof addSubjectSchema>) => {
    createSubjectMutation.mutate(data);
  };

  const handleDeleteClick = (subject: { id: number, name: string }) => {
    setSubjectToDelete(subject);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDelete = () => {
    if (subjectToDelete) {
      deleteSubjectMutation.mutate(subjectToDelete.id);
    }
  };

  return (
    <main className="flex-1 py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            <BookOpenIcon className="inline-block mr-2" size={20} /> 科目管理
          </h1>
          
          <Button onClick={() => setIsAddSubjectModalOpen(true)}>
            <PlusIcon className="mr-1 h-4 w-4" /> 新增科目
          </Button>
        </div>
        
        {isLoading ? (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-3">
              <span className="animate-spin inline-block h-8 w-8 border-4 border-gray-300 border-t-primary-600 rounded-full"></span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">正在加載...</h3>
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-3">
              <BookOpenIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">暫無科目數據</h3>
            <p className="text-gray-500 mb-4">點擊"新增科目"按鈕添加</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.map((subject: { id: number, name: string }) => (
              <div key={subject.id} className="bg-white shadow rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{subject.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-900 hover:bg-red-50"
                    onClick={() => handleDeleteClick(subject)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      <Dialog open={isAddSubjectModalOpen} onOpenChange={setIsAddSubjectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增科目</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>科目名稱</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="輸入科目名稱" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddSubjectModalOpen(false);
                    form.reset();
                  }}
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSubjectMutation.isPending}
                >
                  {createSubjectMutation.isPending ? "新增中..." : "新增"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              確定要刪除科目「{subjectToDelete?.name}」嗎？此操作無法撤銷。
            </p>
            <p className="text-sm text-gray-500 mt-2">
              注意：刪除科目不會刪除關聯的卡片，但卡片將失去科目關聯。
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsDeleteConfirmationOpen(false);
                setSubjectToDelete(null);
              }}
            >
              取消
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteSubjectMutation.isPending}
            >
              {deleteSubjectMutation.isPending ? "刪除中..." : "確認刪除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
