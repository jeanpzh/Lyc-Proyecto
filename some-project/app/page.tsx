"use client"

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ClipboardCopy, Play, RefreshCw } from 'lucide-react'
import dynamic from 'next/dynamic'
import { loader } from '@monaco-editor/react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

// Configurar el CDN para Monaco Editor
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs' } })

export default function Home() {
  const [code, setCode] = useState<string>('// Escribe tu código aquí')
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const editorRef = useRef(null)

  const executeCode = async () => {
    try {
      const res = await fetch('/api/lexer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data.resultado)
        setError('')
      } else {
        setResult('')
        setError(data.error)
      }
    } catch (error) {
      setError('Error al ejecutar el código.')
      setResult('')
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    alert('Código copiado al portapapeles')
  }

  const handleEditorDidMount = (editor :any, monaco :any) => {
    editorRef.current = editor
  }

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run()
    }
  }

  const insertSampleCode = () => {
    const sampleCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`
    setCode(sampleCode)
  }

  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Ejecutor de Código</h1>
      <div className="h-[400px] border rounded-md overflow-hidden">
        <MonacoEditor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={setCode}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </div>
      <div className="flex space-x-2">
        <Button onClick={executeCode} id="runButton">
          <Play className="mr-2 h-4 w-4" /> Ejecutar Código
        </Button>
        <Button onClick={copyCode} id="copyButton" variant="outline">
          <ClipboardCopy className="mr-2 h-4 w-4" /> Copiar Código
        </Button>
        <Button onClick={formatCode} id="formatButton" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Formatear Código
        </Button>
        <Button onClick={insertSampleCode} id="sampleButton" variant="outline">
          Insertar Código de Ejemplo
        </Button>
      </div>
      {result && (
        <Alert>
          <AlertTitle>Resultado</AlertTitle>
          <AlertDescription>
            <pre className="whitespace-pre-wrap">{result}</pre>
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </main>
  )
}
