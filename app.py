from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import json
import random

app = Flask(__name__)
CORS(app)

ARCHIVO_DATOS = "tokeji_datos.json"

def cargar_datos():
    try:
        with open(ARCHIVO_DATOS, "r") as f:
            return json.load(f)
    except:
        return {
            "toques_por_usuario": {},
            "toques_recibidos": {},
            "respuestas_recibidas": {},
            "desafios_pendientes": {},
            "combates_finalizados": []
        }

def guardar_datos():
    with open(ARCHIVO_DATOS, "w") as f:
        json.dump({
            "toques_por_usuario": toques_por_usuario,
            "toques_recibidos": toques_recibidos,
            "respuestas_recibidas": respuestas_recibidas,
            "desafios_pendientes": desafios_pendientes,
            "combates_finalizados": combates_finalizados
        }, f)

datos = cargar_datos()
toques_por_usuario = datos["toques_por_usuario"]
toques_recibidos = datos["toques_recibidos"]
respuestas_recibidas = datos.get("respuestas_recibidas", {})
desafios_pendientes = datos["desafios_pendientes"]
combates_finalizados = datos.get("combates_finalizados", [])

EMOJIS_DATABASE = [
    {"id": i, "rarity": r} for i, r in enumerate([
        "comun", "comun", "comun", "raro", "epico", "comun", "raro", "comun", "raro", "comun",
        "comun", "comun", "comun", "comun", "comun", "comun", "raro", "comun", "raro", "comun",
        "raro", "comun", "comun", "raro", "epico", "comun", "comun", "comun", "raro", "comun",
        "raro", "comun", "comun", "comun", "raro", "comun", "comun", "epico", "comun", "raro",
        "raro", "comun", "comun", "comun", "epico", "comun", "raro", "comun", "raro", "epico",
        "raro", "comun", "raro", "epico", "raro", "epico", "raro", "epico", "mitico", "raro",
        "epico", "raro", "epico", "comun", "raro", "comun", "epico", "raro", "comun", "comun",
        "comun", "comun", "epico", "raro", "epico", "comun", "comun", "comun", "comun", "comun",
        "epico", "raro", "comun", "comun", "comun", "comun", "comun", "comun", "comun", "comun",
        "comun", "comun", "comun", "comun", "comun", "comun", "comun", "comun", "comun", "comun",
        "comun", "comun", "comun", "comun", "comun", "comun", "comun", "comun", "raro", "comun",
        "raro", "comun", "comun", "raro", "raro", "comun", "comun", "comun", "comun", "comun",
        "comun", "comun", "comun", "comun", "comun", "comun", "comun", "raro", "comun", "comun",
        "comun", "comun", "comun", "comun", "comun", "comun", "comun", "raro", "comun", "comun",
        "comun", "legendario", "legendario", "comun", "comun", "comun", "comun", "comun", "raro",
        "epico", "comun", "raro", "epico", "comun", "comun", "raro", "epico", "comun", "comun"
    ], start=1)
]

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

@app.route("/toque", methods=["POST"])
def toque():
    try:
        data = request.get_json()
        de = data.get("de")
        para = data.get("para")
        num = data.get("num")
        contexto = data.get("contexto")
        avatar_remitente = data.get("avatarRemitente", "👤")
        nombre_remitente = data.get("nombreRemitente", "Alguien")

        if not all([de, para, num]):
            return jsonify(ok=False, error="Faltan datos requeridos"), 400

        clave_usuario = f"rl:{de}"
        contador = toques_por_usuario.get(clave_usuario, 0)
        
        if contador >= 30:
            return jsonify(ok=False, error="Límite de 30 tokes alcanzado", toques_restantes=0)

        toques_por_usuario[clave_usuario] = contador + 1
        
        if para not in toques_recibidos:
            toques_recibidos[para] = []
        
        toques_recibidos[para].append({
            "de": de,
            "num": num,
            "contexto": contexto,
            "avatarRemitente": avatar_remitente,
            "nombreRemitente": nombre_remitente,
            "hora": int(time.time())
        })
        
        guardar_datos()
        
        toques_restantes = 30 - (contador + 1)
        return jsonify(ok=True, mensaje="Toke enviado", toques_restantes=toques_restantes)

    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/toques-pendientes", methods=["GET"])
def toques_pendientes():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400
        
        ahora = int(time.time())
        if user_id in toques_recibidos:
            toques_recibidos[user_id] = [
                t for t in toques_recibidos[user_id]
                if ahora - t["hora"] < 3600
            ]
        
        toques = toques_recibidos.get(user_id, [])
        toques_recibidos[user_id] = []
        guardar_datos()
        
        return jsonify(ok=True, toques=toques)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/respuesta", methods=["POST"])
def enviar_respuesta():
    try:
        data = request.get_json()
        de = data.get("de")
        para = data.get("para")
        respuesta = data.get("respuesta")
        texto = data.get("texto")
        avatar_remitente = data.get("avatarRemitente", "👤")
        nombre_remitente = data.get("nombreRemitente", "Alguien")

        if not all([de, para, respuesta]):
            return jsonify(ok=False, error="Faltan datos requeridos (de, para, respuesta)"), 400

        if para not in respuestas_recibidas:
            respuestas_recibidas[para] = []
        
        respuestas_recibidas[para].append({
            "de": de,
            "respuesta": respuesta,
            "texto": texto or "OK",
            "avatarRemitente": avatar_remitente,
            "nombreRemitente": nombre_remitente,
            "hora": int(time.time())
        })
        
        guardar_datos()
        
        return jsonify(ok=True, mensaje="Respuesta enviada")
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/respuestas-pendientes", methods=["GET"])
def respuestas_pendientes():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400
        
        ahora = int(time.time())
        if user_id in respuestas_recibidas:
            respuestas_recibidas[user_id] = [
                r for r in respuestas_recibidas[user_id]
                if ahora - r["hora"] < 3600
            ]
        
        respuestas = respuestas_recibidas.get(user_id, [])
        respuestas_recibidas[user_id] = []
        guardar_datos()
        
        return jsonify(ok=True, respuestas=respuestas)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/desafio", methods=["POST"])
def crear_desafio():
    try:
        data = request.get_json()
        de = data.get("de", "").strip()
        para = data.get("para", "").strip()
        mi_emoji_id = data.get("miEmojiId")
        
        if not all([de, para, mi_emoji_id]):
            return jsonify(ok=False, error="Faltan datos"), 400
        
        desafio_id = f"{de}_{para}_{int(time.time())}"
        desafio = {
            "id": desafio_id,
            "de": de,
            "para": para,
            "miEmojiId": mi_emoji_id,
            "creado": int(time.time())
        }
        
        if para not in desafios_pendientes:
            desafios_pendientes[para] = []
        desafios_pendientes[para].append(desafio)
        
        guardar_datos()
        
        return jsonify(ok=True, desafio_id=desafio_id)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/desafios-pendientes", methods=["GET"])
def obtener_desafios_pendientes():
    try:
        user_id = request.args.get("userId", "").strip()
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400
        
        ahora = int(time.time())
        for usuario in list(desafios_pendientes.keys()):
            desafios_pendientes[usuario] = [
                d for d in desafios_pendientes[usuario]
                if ahora - d["creado"] < 86400
            ]
            if not desafios_pendientes[usuario]:
                del desafios_pendientes[usuario]
        
        desafios = desafios_pendientes.get(user_id, [])
        return jsonify(ok=True, desafios=desafios)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/desafio/responder", methods=["POST"])
def responder_desafio():
    try:
        data = request.get_json()
        desafio_id = data.get("desafioId", "").strip()
        aceptado = bool(data.get("aceptado", False))
        mi_emoji_id = data.get("miEmojiId")
        
        if not desafio_id:
            return jsonify(ok=False, error="Falta desafioId"), 400
        
        desafio = None
        for usuario, lista in desafios_pendientes.items():
            for d in lista:
                if d["id"] == desafio_id:
                    desafio = d
                    break
            if desafio:
                break
        
        if not desafio:
            return jsonify(ok=False, error="Desafío no encontrado"), 404
        
        for usuario in desafios_pendientes:
            desafios_pendientes[usuario] = [
                d for d in desafios_pendientes[usuario]
                if d["id"] != desafio_id
            ]
        
        if not aceptado:
            guardar_datos()
            return jsonify(ok=True, mensaje="Desafío rechazado")
        
        poder_atacante = random.random() * 100
        poder_defensor = random.random() * 100
        ganador = desafio["de"] if poder_atacante > poder_defensor else desafio["para"]
        
        resultado = {
            "id": desafio_id,
            "de": desafio["de"],
            "para": desafio["para"],
            "ganador": ganador,
            "miEmoji": desafio["miEmojiId"],
            "suEmoji": mi_emoji_id,
            "miPoder": poder_atacante,
            "suPoder": poder_defensor,
            "timestamp": int(time.time())
        }
        
        combates_finalizados.append(resultado)
        
        ahora = int(time.time())
        combates_finalizados[:] = [c for c in combates_finalizados if ahora - c["timestamp"] < 86400]
        
        guardar_datos()
        
        return jsonify(ok=True, resultado=resultado)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/combates-finalizados", methods=["GET"])
def obtener_combates_finalizados():
    try:
        user_id = request.args.get("userId", "").strip()
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400
        
        combates_usuario = []
        
        for c in combates_finalizados:
            if c.get("de") == user_id or c.get("para") == user_id:
                clave_visto = f"visto_{user_id}"
                if not c.get(clave_visto, False):
                    combates_usuario.append(c)
                    c[clave_visto] = True
        
        guardar_datos()
        
        return jsonify(ok=True, combates=combates_usuario)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify(ok=True, status="running", version="1.1.0")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Tokeji iniciando en puerto {port}")
    app.run(host="0.0.0.0", port=port)