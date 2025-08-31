import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: Request) {
  try {
    const webhookData = await req.json();
    console.log("Webhook recibido:", JSON.stringify(webhookData));

    if (webhookData.type === "message" && webhookData.message && webhookData.message.text) {
      const messageText = webhookData.message.text;
      const senderNumber = webhookData.message.from;
      
      if (messageText.includes("#to-do")) {
        const taskTitle = messageText.replace("#to-do", "").trim();
        
        if (taskTitle) {
          const { data: task, error } = await supabase
            .from("todos")
            .insert([{ 
              title: taskTitle,
              completed: false 
            }])
            .select();

          if (error) {
            console.error("Error al insertar en Supabase:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }

          await sendWhatsAppResponse(senderNumber, `✅ Tarea creada: ${taskTitle}`);
          
          return NextResponse.json({ success: true, task });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error procesando webhook:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}

async function sendWhatsAppResponse(to: string, text: string) {
  try {
    const response = await fetch("https://www.wasenderapi.com/api/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.WASENDER_API_KEY}`
      },
      body: JSON.stringify({
        to,
        text
      })
    });

    if (!response.ok) {
      throw new Error(`Error enviando mensaje: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error enviando respuesta WhatsApp:", error);
    throw error;
  }
}