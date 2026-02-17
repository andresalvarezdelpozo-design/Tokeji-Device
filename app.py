from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import json
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

ARCHIVO_DATOS = "tokeji_datos.json"

def cargar_datos():
    try:
        with open(ARCHIVO_DATOS, "r") as f:
            return json.load(f)
    except:
        return {
            "usuarios": {},  # Perfiles de usuario
            "toques": {},    # Toques pendientes por usuario
            "sobres": {},    # Sobres pendientes por usuario
            "respuestas": {}, # Respuestas pendientes
            "desafios": {},  # Desafíos de combate
            "combates": [],  # Combates finalizados
            "encuestas": {}, # Votos de encuestas por instituto
            "consentimientos": {}, # Doble consentimiento
            "stats": {}      # Estadísticas agregadas
        }

def guardar_datos():
    with open(ARCHIVO_DATOS, "w") as f:
        json.dump(datos, f)

datos = cargar_datos()

# Helpers
def get_hoy():
    return datetime.now().strftime("%Y-%m-%d")

def limpiar_antiguos():
    """Limpiar datos antiguos (>24h)"""
    ahora = time.time()
    for key in ["toques", "sobres", "respuestas"]:
        for user_id in list(datos[key].keys()):
            datos[key][user_id] = [
                item for item in datos[key][user_id] 
                if ahora - item.get("timestamp", 0) < 86400
            ]
            if not datos[key][user_id]:
                del datos[key][user_id]
    
    # Limpiar combates antiguos
    datos["combates"] = [
        c for c in datos["combates"] 
        if ahora - c.get("timestamp", 0) < 86400
    ]

# ===== ENDPOINTS ESTÁTICOS =====

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

# ===== PERFIL =====

@app.route("/perfil", methods=["POST"])
def guardar_perfil():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400
        
        datos["usuarios"][user_id] = {
            "nombre": data.get("nombre"),
            "avatar": data.get("avatar"),
            "instituto": data.get("instituto"),
            "curso": data.get("curso"),
            "genero": data.get("genero"),
            "ciudad": data.get("ciudad"),
            "registrado": data.get("registrado"),
            "ultimo_acceso": time.time()
        }
        
        guardar_datos()
        return jsonify(ok=True)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/usuarios", methods=["GET"])
def listar_usuarios():
    try:
        instituto = request.args.get("instituto")
        curso = request.args.get("curso")
        genero = request.args.get("genero")
        limite = int(request.args.get("limite", 50))
        
        usuarios = []
        for uid, u in datos["usuarios"].items():
            if instituto and u.get("instituto") != instituto:
                continue
            if curso and u.get("curso") != curso:
                continue
            if genero and u.get("genero") != genero:
                continue
            
            # No exponer datos sensibles
            usuarios.append({
                "id": uid,
                "nombre": u.get("nombre"),
                "avatar": u.get("avatar"),
                "curso": u.get("curso"),
                "genero": u.get("genero"),
                "todexCount": random.randint(10, 40)  # Simulado
            })
        
        return jsonify(ok=True, usuarios=usuarios[:limite])
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

# ===== SOBRES =====

@app.route("/sobre", methods=["POST"])
def enviar_sobre():
    try:
        data = request.get_json()
        para = data.get("para")
        
        if not para:
            return jsonify(ok=False, error="Falta destinatario"), 400
        
        if para not in datos["sobres"]:
            datos["sobres"][para] = []
        
        datos["sobres"][para].append({
            "de": data.get("de"),
            "tipo": data.get("tipo"),
            "mensaje": data.get("mensaje"),
            "esSecreto": data.get("esSecreto"),
            "avatarRemitente": data.get("avatarRemitente"),
            "nombreRemitente": data.get("nombreRemitente"),
            "timestamp": time.time()
        })
        
        guardar_datos()
        return jsonify(ok=True)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/sobres-pendientes", methods=["GET"])
def sobres_pendientes():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400
        
        limpiar_antiguos()
        
        sobres = datos["sobres"].get(user_id, [])
        datos["sobres"][user_id] = []  # Limpiar al entregar
        guardar_datos()
        
        return jsonify(ok=True, sobres=sobres)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

# ===== TOQUES 20 (ORIGINAL) =====

@app.route("/toque", methods=["POST"])
def enviar_toque():
    try:
        data = request.get_json()
        de = data.get("de")
        para = data.get("para")
        
        if not all([de, para]):
            return jsonify(ok=False, error="Faltan datos"), 400
        
        # Verificar límite (simplificado)
        clave = f"toques_hoy_{de}_{get_hoy()}"
        contador = datos["stats"].get(clave, 0)
        if contador >= 30:
            return jsonify(ok=False, error="Límite alcanzado", toques_restantes=0)
        
        datos["stats"][clave] = contador + 1
        
        if para not in datos["toques"]:
            datos["toques"][para] = []
        
        datos["toques"][para].append({
            "de": de,
            "num": data.get("num"),
            "contexto": data.get("contexto"),
            "avatarRemitente": data.get("avatarRemitente"),
            "nombreRemitente": data.get("nombreRemitente"),
            "timestamp": time.time()
        })
        
        guardar_datos()
        
        return jsonify(ok=True, toques_restantes=30 - contador - 1)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/toques-pendientes", methods=["GET"])
def toques_pendientes():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400
        
        limpiar_antiguos()
        
        toques = datos["toques"].get(user_id, [])
        datos["toques"][user_id] = []
        guardar_datos()
        
        return jsonify(ok=True, toques=toques)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

# ===== COMBATES =====

@app.route("/desafio", methods=["POST"])
def crear_desafio():
    try:
        data = request.get_json()
        de = data.get("de")
        para = data.get("para")
        mi_emoji = data.get("miEmojiId")
        
        if not all([de, para, mi_emoji]):
            return jsonify(ok=False, error="Faltan datos"), 400
        
        desafio_id = f"{de}_{para}_{int(time.time())}"
        
        if para not in datos["desafios"]:
            datos["desafios"][para] = []
        
        datos["desafios"][para].append({
            "id": desafio_id,
            "de": de,
            "para": para,
            "miEmoji": mi_emoji,
            "timestamp": time.time()
        })
        
        guardar_datos()
        return jsonify(ok=True, desafio_id=desafio_id)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/desafios-pendientes", methods=["GET"])
def desafios_pendientes():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400
        
        # Limpiar antiguos (>5 min)
        ahora = time.time()
        for uid in list(datos["desafios"].keys()):
            datos["desafios"][uid] = [
                d for d in datos["desafios"][uid] 
                if ahora - d.get("timestamp", 0) < 300
            ]
        
        desafios = datos["desafios"].get(user_id, [])
        return jsonify(ok=True, desafios=desafios)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/desafio/responder", methods=["POST"])
def responder_desafio():
    try:
        data = request.get_json()
        desafio_id = data.get("desafioId")
        aceptado = data.get("aceptado")
        mi_emoji = data.get("miEmojiId")
        
        # Buscar desafío
        desafio = None
        for uid, lista in datos["desafios"].items():
            for d in lista:
                if d["id"] == desafio_id:
                    desafio = d
                    break
        
        if not desafio:
            return jsonify(ok=False, error="Desafío no encontrado"), 404
        
        # Eliminar de pendientes
        for uid in datos["desafios"]:
            datos["desafios"][uid] = [d for d in datos["desafios"][uid] if d["id"] != desafio_id]
        
        if not aceptado:
            guardar_datos()
            return jsonify(ok=True, mensaje="Rechazado")
        
        # Calcular resultado
        poder1 = random.random() * 100
        poder2 = random.random() * 100
        ganador = desafio["de"] if poder1 > poder2 else desafio["para"]
        
        resultado = {
            "id": desafio_id,
            "de": desafio["de"],
            "para": desafio["para"],
            "ganador": ganador,
            "miEmoji": desafio["miEmoji"],
            "suEmoji": mi_emoji,
            "miPoder": poder1,
            "suPoder": poder2,
            "timestamp": time.time(),
            f"visto_{desafio['de']}": False,
            f"visto_{desafio['para']}": False
        }
        
        datos["combates"].append(resultado)
        guardar_datos()
        
        return jsonify(ok=True, resultado=resultado)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/combates-finalizados", methods=["GET"])
def combates_finalizados():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400
        
        limpiar_antiguos()
        
        combates_usuario = []
        for c in datos["combates"]:
            if c.get("de") == user_id or c.get("para") == user_id:
                clave_visto = f"visto_{user_id}"
                if not c.get(clave_visto, False):
                    combates_usuario.append(c)
                    c[clave_visto] = True
        
        guardar_datos()
        return jsonify(ok=True, combates=combates_usuario)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

# ===== ENCUESTAS =====

@app.route("/encuesta/pregunta", methods=["GET"])
def encuesta_pregunta():
    try:
        instituto = request.args.get("instituto")
        
        # Preguntas rotativas (cambian cada día)
        preguntas = [
            "¿Quién tiene la mejor sonrisa del instituto?",
            "¿Quién es más amable de lo que parece?",
            "¿Quién te hizo reír últimamente?",
            "¿Quién crees que será más exitoso?",
            "¿Quién tiene mejor estilo sin esfuerzo?",
            "¿Quién alegra el día sin saberlo?",
            "¿Quién es el más creativo?",
            "¿Quién tiene mejor energía positiva?"
        ]
        
        # Seleccionar basado en fecha
        dia = int(datetime.now().strftime("%j"))
        pregunta = preguntas[dia % len(preguntas)]
        
        return jsonify(ok=True, pregunta={
            "id": f"enc_{instituto}_{get_hoy()}",
            "texto": pregunta
        })
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/encuesta/votar", methods=["POST"])
def votar_encuesta():
    try:
        data = request.get_json()
        de = data.get("de")
        para = data.get("para")
        instituto = data.get("instituto")
        
        if not all([de, para, instituto]):
            return jsonify(ok=False, error="Faltan datos"), 400
        
        clave = f"{instituto}_{get_hoy()}"
        if clave not in datos["encuestas"]:
            datos["encuestas"][clave] = []
        
        # Evitar votos duplicados
        existente = next((v for v in datos["encuestas"][clave] if v["de"] == de), None)
        if existente:
            return jsonify(ok=False, error="Ya votaste hoy"), 400
        
        datos["encuestas"][clave].append({
            "de": de,
            "para": para,
            "timestamp": time.time()
        })
        
        guardar_datos()
        return jsonify(ok=True)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/encuesta/match", methods=["GET"])
def verificar_match():
    try:
        user1 = request.args.get("user1")
        user2 = request.args.get("user2")
        instituto = datos["usuarios"].get(user1, {}).get("instituto")
        
        if not instituto:
            return jsonify(ok=False, error="Sin instituto"), 400
        
        clave = f"{instituto}_{get_hoy()}"
        votos = datos["encuestas"].get(clave, [])
        
        # Buscar si user1 votó por user2
        voto1 = next((v for v in votos if v["de"] == user1 and v["para"] == user2), None)
        # Buscar si user2 votó por user1  
        voto2 = next((v for v in votos if v["de"] == user2 and v["para"] == user1), None)
        
        match = voto1 is not None and voto2 is not None
        
        return jsonify(ok=True, match=match)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/encuesta/consentimiento", methods=["POST"])
def consentimiento_revelar():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        otro_id = data.get("otroId")
        acepta = data.get("acepta")
        
        clave = f"{min(user_id, otro_id)}_{max(user_id, otro_id)}"
        
        if clave not in datos["consentimientos"]:
            datos["consentimientos"][clave] = {}
        
        datos["consentimientos"][clave][user_id] = acepta
        
        # Verificar si ambos aceptaron
        ambos = (datos["consentimientos"][clave].get(user_id) and 
                 datos["consentimientos"][clave].get(otro_id))
        
        guardar_datos()
        
        return jsonify(ok=True, revelado=ambos)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

# ===== STATS INSTITUTO (MURMULLO) =====

@app.route("/stats-instituto", methods=["GET"])
def stats_instituto():
    try:
        instituto = request.args.get("instituto")
        if not instituto:
            return jsonify(ok=False, error="Falta instituto"), 400
        
        # Calcular stats agregadas (anónimas)
        usuarios_insti = [u for u in datos["usuarios"].values() if u.get("instituto") == instituto]
        
        # Sobres hoy
        clave_hoy = f"{instituto}_{get_hoy()}"
        sobres_hoy = {"verde": 0, "azul": 0, "morado": 0, "blanco": 0}
        
        # Simular/contar sobres reales
        for sobres_list in datos["sobres"].values():
            for s in sobres_list:
                tipo = s.get("tipo", "verde")
                if tipo in sobres_hoy:
                    sobres_hoy[tipo] += 1
        
        stats = {
            "conectados": len(usuarios_insti),
            "sobresHoy": sobres_hoy,
            "rachasActivas": random.randint(50, 150),  # Simulado
            "todexConsultados": random.randint(100, 300),  # Simulado
            "nuevosHoy": sum(1 for u in usuarios_insti if time.time() - u.get("registrado", 0) < 86400),
            "matchesMutuos": len(datos["consentimientos"]),  # Simplificado
            "tendencias": {
                "cursoMasActivo": "2º Bach",  # Simulado
                "sobreMasUsado": max(sobres_hoy, key=sobres_hoy.get) if any(sobres_hoy.values()) else "verde",
                "horaPico": "14:23"  # Simulado
            },
            "miPosicion": "top 15%"  # Simulado
        }
        
        return jsonify(ok=True, stats=stats)
        
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify(ok=True, version="17.0", status="running")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)