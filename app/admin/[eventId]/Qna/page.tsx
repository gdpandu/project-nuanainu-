"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { 
  MessageSquarePlus, 
  Trash2, 
  HelpCircle, 
  Edit2, 
  X, 
  Check, 
  Search,
  BookOpen
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { supabase } from "@/lib/supabase"

interface qna {
  id: string
  question: string
  answer: string
}

export default function GeneralInfoPage() {
  const params = useParams()
  const eventId = params.eventId as string

  // State Utama
  const [faqs, setFaqs] = React.useState<qna[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)

  // State Form Tambah Baru
  const [question, setQuestion] = React.useState("")
  const [answer, setAnswer] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // State Mode Edit
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editQuestion, setEditQuestion] = React.useState("")
  const [editAnswer, setEditAnswer] = React.useState("")
  const [isUpdating, setIsUpdating] = React.useState(false)

  // 1. Ambil data dari database (READ)
  React.useEffect(() => {
    const fetchQnA = async () => {
      if (!eventId) return
      setIsLoading(true)
      const { data, error } = await supabase
        .from("qna")
        .select("id, question, answer")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })

      if (!error && data) setFaqs(data)
      setIsLoading(false)
    }
    fetchQnA()
  }, [eventId])

  // 2. Fungsi Tambah Data (CREATE)
  const handleAddQnA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) return

    setIsSubmitting(true)
    const { data, error } = await supabase
      .from("qna")
      .insert([{ event_id: eventId, question, answer }])
      .select()
      .single()

    if (!error && data) {
      setFaqs([data, ...faqs])
      setQuestion("")
      setAnswer("")
    } else {
      alert("Gagal menambahkan info baru.")
    }
    setIsSubmitting(false)
  }

  // 3. Fungsi Update Data (UPDATE)
  const handleUpdate = async (id: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return

    setIsUpdating(true)
    const { error } = await supabase
      .from("qna")
      .update({ question: editQuestion, answer: editAnswer })
      .eq("id", id)

    if (!error) {
      setFaqs(faqs.map(f => f.id === id ? { ...f, question: editQuestion, answer: editAnswer } : f))
      setEditingId(null)
    } else {
      alert("Gagal memperbarui info.")
    }
    setIsUpdating(false)
  }

  // 4. Fungsi Hapus Data (DELETE)
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus informasi ini? Ini akan mempengaruhi pengetahuan bot AI.")) return
    const { error } = await supabase.from("qna").delete().eq("id", id)
    if (!error) setFaqs(faqs.filter((f) => f.id !== id))
  }

  // Filter pencarian sederhana
  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Info & FAQ</h1>
          <p className="text-muted-foreground">Kelola basis pengetahuan bot AI untuk event ini.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Cari info..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: FORM TAMBAH (Floating Style) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-md border-[#2b664d]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-[#2b664d]">
                <MessageSquarePlus className="size-5" />
                Tambah Info Baru
              </CardTitle>
              <CardDescription>Pertanyaan ini akan dipelajari oleh bot.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddQnA} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Pertanyaan</label>
                  <Input 
                    placeholder="Contoh: Lokasi parkir dimana?" 
                    value={question} 
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Jawaban</label>
                  <Textarea 
                    placeholder="Contoh: Parkir tersedia di area sayap barat..." 
                    value={answer} 
                    onChange={(e) => setAnswer(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>
                <Button disabled={isSubmitting} className="w-full bg-[#2b664d] hover:bg-[#204d3a] text-white">
                  {isSubmitting ? <Spinner className="mr-2 size-4" /> : null}
                  Simpan Info
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN: LIST DATA */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="size-5" /> Knowledge List ({filteredFaqs.length})
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner className="size-8 text-[#2b664d]" /></div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/30 text-muted-foreground">
              {searchTerm ? "Tidak ada info yang cocok dengan pencarian." : "Belum ada data General Info."}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFaqs.map((f) => (
                <Card key={f.id} className="group relative border-l-4 border-l-transparent hover:border-l-[#2b664d] transition-all overflow-hidden shadow-sm">
                  
                  {editingId === f.id ? (
                    /* MODE EDITING */
                    <CardContent className="pt-6 space-y-4 bg-[#2b664d]/5">
                      <div className="space-y-2">
                        <Input 
                          value={editQuestion} 
                          onChange={(e) => setEditQuestion(e.target.value)}
                          className="font-bold"
                        />
                        <Textarea 
                          value={editAnswer} 
                          onChange={(e) => setEditAnswer(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Batal</Button>
                        <Button 
                          size="sm" 
                          className="bg-[#2b664d] text-white"
                          onClick={() => handleUpdate(f.id)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? <Spinner className="size-4 mr-2" /> : <Check className="size-4 mr-2" />}
                          Simpan Perubahan
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    /* MODE TAMPILAN NORMAL */
                    <>
                      <CardHeader className="pb-2 pr-24">
                        <CardTitle className="text-base font-bold leading-tight">Q: {f.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">A: {f.answer}</p>
                      </CardContent>

                      {/* Tombol Hover */}
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="size-8 text-blue-600"
                          onClick={() => {
                            setEditingId(f.id)
                            setEditQuestion(f.question)
                            setEditAnswer(f.answer)
                          }}
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="size-8 text-red-500"
                          onClick={() => handleDelete(f.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}