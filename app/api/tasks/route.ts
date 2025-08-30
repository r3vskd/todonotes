import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function POST(req: Request) {
  const { title } = await req.json();
  let improvedTitle = title;

  try {
    // Intentar mejorar el título con n8n
    const res = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({title}),
    });

    if (res.ok) {
      const data = await res.json();
      // Verificar diferentes formatos posibles de respuesta
      if (data.improvedTitle) {
        improvedTitle = data.improvedTitle;
      } else if (typeof data === 'string') {
        // Si n8n devuelve directamente un string
        improvedTitle = data;
      } else if (data.choices && data.choices[0] && data.choices[0].message) {
        // Si devuelve el formato directo de OpenAI
        improvedTitle = data.choices[0].message.content;
      }
      console.log("Título mejorado recibido:", improvedTitle);
    } else {
      console.error("Error al conectar con n8n, usando título original");
    }
  } catch (error) {
    console.error("Error al conectar con n8n:", error);
    // Continuar con el título original si n8n no está disponible
  }

  try {
    const { data: task, error } = await supabase
      .from("todos")
      .insert([{ 
        title: improvedTitle,
        completed: false 
      }])
      .select();

    if (error) {
      console.error("Error al insertar en Supabase:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(task);
  } catch (dbError) {
    console.error("Error al insertar en la base de datos:", dbError);
    return NextResponse.json(
      { error: "Error al guardar la tarea" },
      { status: 500 }
    );
  }
}
