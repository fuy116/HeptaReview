import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCardSchema } from "@shared/schema";
import { PlusIcon } from "lucide-react";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCardModal({ isOpen, onClose }: AddCardModalProps) {
  const { toast } = useToast();
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");

  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/subjects'],
    enabled: isOpen,
  });

  const addCardSchema = insertCardSchema.extend({
    cardName: z.string().min(1, "卡片名稱不能為空"),
    subject: z.string().min(1, "科目不能為空"),
    note: z.string().optional(),
  });

  const form = useForm<z.infer<typeof addCardSchema>>({
    resolver: zodResolver(addCardSchema),
    defaultValues: {
      cardName: "",
      subject: "",
      note: "",
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        cardName: "",
        subject: subjects.length > 0 ? subjects[0].name : "",
        note: "",
      });
    }
  }, [isOpen, subjects, form]);

  const createCardMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addCardSchema>) => {
      const response = await apiRequest('POST', '/api/cards', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/subject-distribution'] });
      toast({
        title: "卡片已新增",
        description: "卡片已成功新增",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "新增失敗",
        description: "新增卡片時發生錯誤",
        variant: "destructive",
      });
    }
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest('POST', '/api/subjects', { name });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      toast({
        title: "科目已新增",
        description: "科目已成功新增",
      });
      form.setValue("subject", data.name);
      setIsSubjectModalOpen(false);
      setNewSubject("");
    },
    onError: () => {
      toast({
        title: "新增失敗",
        description: "新增科目時發生錯誤",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof addCardSchema>) => {
    createCardMutation.mutate(data);
  };

  const handleAddSubject = () => {
    if (newSubject.trim() === "") {
      toast({
        title: "科目名稱不能為空",
        variant: "destructive",
      });
      return;
    }
    createSubjectMutation.mutate(newSubject);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增卡片</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cardName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>卡片名稱</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="輸入卡片名稱" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>所屬科目</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="選擇科目" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.length === 0 ? (
                            <SelectItem value="" disabled>
                              無科目可選
                            </SelectItem>
                          ) : (
                            subjects.map((subject: { id: number, name: string }) => (
                              <SelectItem key={subject.id} value={subject.name}>
                                {subject.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsSubjectModalOpen(true)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>備註（選填）</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="輸入備註" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                取消
              </Button>
              <Button 
                type="submit" 
                disabled={createCardMutation.isPending}
              >
                {createCardMutation.isPending ? "新增中..." : "新增"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      
      {/* Add Subject Modal */}
      <Dialog open={isSubjectModalOpen} onOpenChange={setIsSubjectModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>新增科目</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">科目名稱</FormLabel>
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="輸入科目名稱"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsSubjectModalOpen(false)}
            >
              取消
            </Button>
            <Button 
              type="button" 
              onClick={handleAddSubject}
              disabled={createSubjectMutation.isPending}
            >
              {createSubjectMutation.isPending ? "新增中..." : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
