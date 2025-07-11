"use client";

import Link from "next/link";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { useState } from "react";
import BackButton from "@/components/back-button";
import PageTitle from "@/components/page-title";
import AdminImageUploader from "@/components/dashboard/image-uploader";

// Shadcn
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircleIcon,
  CircleCheckIcon,
  EllipsisIcon,
  ImageIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  PresentationIcon,
  StarIcon,
  Trash2Icon,
  TrashIcon,
} from "lucide-react";

import {
  getMessages,
  updateMessage,
  addMessage,
  deleteMessage,
  makeActiveMessage,
} from "@/data/message/action";

export default function AdminMessagesPage() {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    id?: number;
    title: string;
    content: string;
    image: string | null;
    linkTitle: string | null;
    linkUrl: string | null;
  }>({
    id: 0,
    title: "",
    content: "",
    image: "",
    linkTitle: "",
    linkUrl: "",
  });

  const { data, isLoading: loadingMessages } = useSWR("getMessages", () => getMessages());
  const messages = data?.data;

  const handleSaveMessage = async () => {
    if (formData?.id === undefined) return;
    setActionLoading(true);
    try {
      const result = await addMessage({
        messageData: {
          ...formData,
        },
      });

      if (result === null) {
        toast.error("メッセージの追加に失敗しました。");
        return;
      }

      toast.success("メッセージが正常に追加されました！");
      setShowForm(false);
      setIsEditing(false);
      setFormData({
        title: "",
        content: "",
        image: "",
        linkTitle: "",
        linkUrl: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("メッセージの追加に失敗しました。");
    } finally {
      mutate("getMessages");
      setActionLoading(false);
    }
  };

  const handleUpdateMessage = async () => {
    if (formData?.id === undefined) return;
    setActionLoading(true);
    try {
      const result = await updateMessage({
        id: formData?.id,
        messageData: {
          ...formData,
          id: Number(formData.id),
        },
      });

      if (result === null) {
        toast.error("メッセージの更新に失敗しました。");
        return;
      }

      toast.success("メッセージが正常に更新されました！");
      setShowForm(false);
      setIsEditing(false);
      setFormData({
        title: "",
        content: "",
        image: "",
        linkTitle: "",
        linkUrl: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("メッセージの更新に失敗しました。");
    } finally {
      mutate("getMessages");
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    setActionLoading(true);
    setDeletingId(messageId);
    try {
      const result = await deleteMessage({ id: messageId });

      if (result === null) {
        toast.error("メッセージの削除に失敗しました。");
        return;
      }

      toast.success("メッセージが正常に削除されました！");
      setShowForm(false);
      setIsEditing(false);
      setFormData({
        title: "",
        content: "",
        image: "",
        linkTitle: "",
        linkUrl: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("メッセージの削除に失敗しました。");
    } finally {
      mutate("getMessages");
      setActionLoading(false);
    }
  };

  const makeMessageActive = async (messageId: number) => {
    setActionLoading(true);
    try {
      const result = await makeActiveMessage({ id: messageId });

      if (result === null) {
        toast.error("メッセージの選択に失敗しました。");
        return;
      }

      toast.success("メッセージが有効になりました！");
    } catch (error) {
      console.error(error);
      toast.error("Fメッセージの選択に失敗しました。");
    } finally {
      mutate("getMessages");
      setActionLoading(false);
    }
  };

  function saveBlobAsImage(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle
        title="アプリメッセージ"
        subtitle="新しいセッションごとにメッセージを表示する。"
      />

      <div className="flex tems-center justify-between my-6">
        <div>
          <Button variant="default" size="lg" onClick={() => setShowForm(true)}>
            <PlusCircleIcon /> 新しいメッセージ
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="max-w-4xl mb-8">
          <form className="max-w-md flex flex-col gap-4 p-6 border rounded-lg bg-gray-50">
            <div className="mb-3">
              <h4 className="font-medium text-xl">新しいメッセージ</h4>
            </div>
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="title">メッセージタイトル</Label>
              <Input
                type="text"
                name="title"
                id="title"
                required
                className="bg-white"
                value={formData?.title || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder=""
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="content">メッセージタイトル</Label>
              <Textarea
                name="content"
                required
                id="content"
                className="bg-white"
                value={formData?.content || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder=""
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="linkTitle">リンク</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  name="linkTitle"
                  id="linkTitle"
                  className="bg-white"
                  placeholder="リンクタイトル"
                  value={formData?.linkTitle || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, linkTitle: e.target.value })
                  }
                />
                <Input
                  type="text"
                  name="linkUrl"
                  id="linkUrl"
                  className="bg-white"
                  placeholder="リンク先アドレス"
                  value={formData?.linkUrl || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              {formData?.image ? (
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData((prev) => ({ ...prev, image: null }))}
                    className="absolute top-2 right-2"
                  >
                    <TrashIcon color="red" /> 削除
                  </Button>
                  <img
                    src={formData.image}
                    alt="Dialog image."
                    className="mx-auto  rounded-lg overflow-hidden"
                  />
                </div>
              ) : (
                <AdminImageUploader
                  aspectRatio={[1, 1]}
                  onSave={async (blob: Blob) => {
                    const imageUrl = await saveBlobAsImage(blob);
                    setFormData({ ...formData, image: imageUrl });
                  }}
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                className="flex-grow"
                type="button"
                variant="default"
                onClick={() => (isEditing ? handleUpdateMessage() : handleSaveMessage())}
              >
                {isEditing ? "メッセージを更新" : "メッセージを保存"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setFormData({
                    title: "",
                    content: "",
                    image: "",
                    linkTitle: "",
                    linkUrl: "",
                  });
                }}
              >
                キャンセル
              </Button>

              <Dialog>
                <DialogTrigger className="flex-grow" asChild>
                  <Button type="button" variant="secondary">
                    <PresentationIcon /> プレビューを開く
                  </Button>
                </DialogTrigger>
                <DialogContent
                  showCloseButton={false}
                  className="md:max-w-10/12 lg:max-w-4xl"
                >
                  <DialogHeader className="flex flex-col sm:flex-row sm:items-center gap-6 lg:mb-4">
                    {formData?.image && (
                      <div className="flex justify-center md:max-w-[350px]">
                        <img
                          src={formData.image}
                          alt="Dialog Image"
                          className=" rounded-lg overflow-hidden"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      <DialogTitle className="md:text-2xl">
                        {formData.title || (
                          <span className="text-gray-400">タイトルがありません</span>
                        )}
                      </DialogTitle>
                      <DialogDescription className="md:text-base">
                        {formData.content || (
                          <span className="text-gray-400">内容がありません</span>
                        )}
                      </DialogDescription>
                    </div>
                  </DialogHeader>
                  {formData?.linkTitle && formData?.linkUrl && (
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                      </DialogClose>
                      <Button asChild type="button">
                        <Link href="#" target="_blank">
                          {formData.linkTitle || (
                            <span className="text-sm text-gray-400">
                              リンクがありません
                            </span>
                          )}
                        </Link>
                      </Button>
                    </DialogFooter>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </div>
      )}

      {messages && messages.length > 0 ? (
        <div>
          <Table className="w-full max-w-3xl">
            <TableHeader>
              <TableRow>
                <TableHead colSpan={2}>メッセージ</TableHead>
                <TableHead>有効</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actionLoading === true && (
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <LoaderCircleIcon className="animate-spin" /> Loading ...
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {messages &&
                messages.length > 0 &&
                messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="w-10">
                      {message.image ? (
                        <ImageIcon size={18} strokeWidth={1.5} color="#aaaaaa" />
                      ) : null}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => {
                        setFormData({
                          title: message.title,
                          content: message.content,
                          image: message.image,
                          linkTitle: message.linkTitle,
                          linkUrl: message.linkUrl,
                        });
                        setIsEditing(true);
                        setShowForm(true);
                      }}
                    >
                      {message.title}
                    </TableCell>
                    <TableCell>
                      {message.isActive ? (
                        <StarIcon size={18} color="orange" fill="orange" />
                      ) : (
                        ""
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer">
                          {actionLoading && deletingId === message.id ? (
                            <LoaderCircleIcon className="animate-spin" />
                          ) : (
                            <EllipsisIcon />
                          )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => makeMessageActive(message.id)}
                          >
                            <CircleCheckIcon />
                            有効化
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setFormData({
                                id: message.id,
                                title: message.title,
                                content: message.content,
                                image: message.image,
                                linkTitle: message.linkTitle,
                                linkUrl: message.linkUrl,
                              });
                              setIsEditing(true);
                              setShowForm(true);
                            }}
                          >
                            <PencilIcon />
                            編集
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2Icon />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : loadingMessages ? (
        <div className="flex items-center gap-4">
          <LoaderCircleIcon className="animate-spin" />
          Loading...
        </div>
      ) : (
        <div className="max-w-[400px]">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertCircleIcon />
                メッセージが見つかりませんでした。
              </CardTitle>
              <CardDescription>表示するメッセージはありません。</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">新しいメッセージを作成しましょう。</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
