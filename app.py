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
            "combates_finalizados": [],
            "perfiles": {},
            "amigos": {}
        }

def guardar_datos():
    with open(ARCHIVO_DATOS, "w") as f:
        json.dump({
            "toques_por_usuario": toques_por_usuario,
            "toques_recibidos": toques_recibidos,
            "respuestas_recibidas": respuestas_recibidas,
            "desafios_pendientes": desafios_pendientes,
            "combates_finalizados": combates_finalizados,
            "perfiles": perfiles,
            "amigos": amigos
        }, f)

datos = cargar_datos()
toques_por_usuario = datos["toques_por_usuario"]
toques_recibidos = datos["toques_recibidos"]
respuestas_recibidas = datos.get("respuestas_recibidas", {})
desafios_pendientes = datos["desafios_pendientes"]
combates_finalizados = datos.get("combates_finalizados", [])
perfiles = datos.get("perfiles", {})
amigos = datos.get("amigos", {})

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
        tipo = data.get("tipo")
        instituto_destino = data.get("instituto_destino")

        if not all([de, para, num]):
            return jsonify(ok=False, error="Faltan datos requeridos"), 400

        clave_usuario = f"rl:{de}"
        contador = toques_por_usuario.get(clave_usuario, 0)
        
        if contador >= 30:
            return jsonify(ok=False, error="Límite de 30 tokes alcanzado", toques_restantes=0)

        toques_por_usuario[clave_usuario] = contador + 1
        
        if para not in toques_recibidos:
            toques_recibidos[para] = []
        
        nuevo_toque = {
            "de": de,
            "num": num,
            "contexto": contexto,
            "avatarRemitente": avatar_remitente,
            "nombreRemitente": nombre_remitente,
            "hora": int(time.time())
        }

        if tipo is not None:
            nuevo_toque["tipo"] = tipo
        if instituto_destino is not None:
            nuevo_toque["instituto_destino"] = instituto_destino

        toques_recibidos[para].append(nuevo_toque)
        
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

@app.route("/registro-instituto", methods=["POST"])
def registro_instituto():
    try:
        data = request.get_json() or {}
        user_id = data.get("userId")
        provincia = data.get("provincia")
        instituto = data.get("instituto")
        curso = data.get("curso")

        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400

        perfiles[user_id] = {
            **perfiles.get(user_id, {}),
            "provincia": provincia,
            "instituto": instituto,
            "curso": curso,
            "nombre": data.get("nombre") or perfiles.get(user_id, {}).get("nombre") or "Alumno",
            "avatar": data.get("avatar") or perfiles.get(user_id, {}).get("avatar") or "👤",
            "fecha_registro": int(time.time()),
            "todox_visitados": perfiles.get(user_id, {}).get("todox_visitados", [])
        }

        guardar_datos()
        return jsonify(ok=True)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/lista-instituto", methods=["GET"])
def lista_instituto():
    try:
        user_id = request.args.get("userId")
        curso = request.args.get("curso")

        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400

        instituto_usuario = perfiles.get(user_id, {}).get("instituto")
        if not instituto_usuario:
            return jsonify(ok=True, compañeros=[])

        companeros = []
        for uid, perfil in perfiles.items():
            if uid == user_id:
                continue
            if perfil.get("instituto") != instituto_usuario:
                continue
            if curso and perfil.get("curso") != curso:
                continue
            companeros.append({
                "id": uid,
                "nombre": perfil.get("nombre", "Alumno"),
                "avatar": perfil.get("avatar", "👤"),
                "curso": perfil.get("curso")
            })

        return jsonify(ok=True, compañeros=companeros)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/estadisticas-instituto", methods=["GET"])
def estadisticas_instituto():
    try:
        instituto = request.args.get("instituto")
        if not instituto:
            return jsonify(ok=False, error="Falta instituto"), 400

        ahora = int(time.time())
        hoy_inicio = ahora - (ahora % 86400)

        usuarios_insti = [u for u, p in perfiles.items() if p.get("instituto") == instituto]
        total_alumnos = len(usuarios_insti)

        sobres_hoy = 0
        cursos = {}
        sobres_tipos = {}
        horas = {}

        for uid in usuarios_insti:
            perfil = perfiles.get(uid, {})
            curso = perfil.get("curso", "Desconocido")
            cursos[curso] = cursos.get(curso, 0) + 1

            for toque in toques_recibidos.get(uid, []):
                if toque.get("hora", 0) > hoy_inicio:
                    if toque.get("tipo") in ["anonimo", "crush"]:
                        sobres_hoy += 1
                    tipo = toque.get("tipo", "normal")
                    sobres_tipos[tipo] = sobres_tipos.get(tipo, 0) + 1
                    hora = time.strftime("%H:%M", time.localtime(toque.get("hora", 0)))
                    horas[hora] = horas.get(hora, 0) + 1

        rachas_activas = sum(random.randint(0, 3) for _ in usuarios_insti)

        todox_hoy = 0
        for uid in usuarios_insti:
            visitas = perfiles.get(uid, {}).get("todox_visitados", [])
            todox_hoy += sum(1 for visita in visitas if visita.get("hora", 0) > hoy_inicio)

        nuevos_hoy = sum(1 for uid in usuarios_insti if perfiles.get(uid, {}).get("fecha_registro", 0) > hoy_inicio)

        curso_mas_rachas = max(cursos, key=cursos.get) if cursos else "2º Bach"
        sobre_mas_usado = max(sobres_tipos, key=sobres_tipos.get) if sobres_tipos else "💜 Morado"
        hora_pico = max(horas, key=horas.get) if horas else "21:15"

        return jsonify(
            ok=True,
            total_alumnos=total_alumnos,
            sobres_secretos_hoy=sobres_hoy,
            rachas_activas=rachas_activas,
            todox_visitados_hoy=todox_hoy,
            nuevos_hoy=nuevos_hoy,
            curso_mas_rachas=curso_mas_rachas,
            sobre_mas_usado=sobre_mas_usado,
            hora_pico=hora_pico,
            estadisticas={
                "total_alumnos": total_alumnos,
                "sobres_secretos_hoy": sobres_hoy,
                "rachas_activas": rachas_activas,
                "todox_visitados_hoy": todox_hoy,
                "nuevos_hoy": nuevos_hoy,
                "curso_mas_rachas": curso_mas_rachas,
                "sobre_mas_usado": sobre_mas_usado,
                "hora_pico": hora_pico
            }
        )
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.route("/visitar-todox", methods=["POST"])
def visitar_todox():
    try:
        data = request.get_json() or {}
        user_id = data.get("userId")
        visitado_id = data.get("visitadoId")
        if not user_id or not visitado_id:
            return jsonify(ok=False, error="Faltan userId o visitadoId"), 400

        if user_id not in perfiles:
            perfiles[user_id] = {}
        if "todox_visitados" not in perfiles[user_id]:
            perfiles[user_id]["todox_visitados"] = []

        perfiles[user_id]["todox_visitados"].append({
            "userId": visitado_id,
            "hora": int(time.time())
        })

        guardar_datos()
        return jsonify(ok=True)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500



def calcular_dias_racha(user_id, amigo_id, hoy_inicio):
    historial = []
    for t in toques_recibidos.get(user_id, []):
        if t.get("de") == amigo_id:
            historial.append(t.get("hora", 0))
    for t in toques_recibidos.get(amigo_id, []):
        if t.get("de") == user_id:
            historial.append(t.get("hora", 0))

    dias = sorted({(ts // 86400) for ts in historial if ts})
    if not dias:
        return 0

    dia = dias[-1]
    hoy = hoy_inicio // 86400
    if dia < hoy - 1:
        return 0

    racha = 1
    for i in range(len(dias) - 2, -1, -1):
        if dias[i] == dia - 1:
            racha += 1
            dia = dias[i]
        else:
            break
    return racha


@app.route("/perfil", methods=["GET"])
def obtener_perfil():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify(ok=False, error="Falta userId"), 400
    perfil = perfiles.get(user_id, {})
    return jsonify(ok=True, **perfil)


@app.route("/amigos", methods=["GET"])
def obtener_amigos():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify(ok=False, error="Falta userId"), 400

    ahora = int(time.time())
    hoy_inicio = ahora - (ahora % 86400)
    amigos_ids = amigos.get(user_id, [])

    amigos_completo = []
    for amigo_id in amigos_ids:
        perfil = perfiles.get(amigo_id, {})
        ultimo_toque = 0

        for t in toques_recibidos.get(user_id, []):
            if t.get("de") == amigo_id:
                ultimo_toque = max(ultimo_toque, t.get("hora", 0))
        for t in toques_recibidos.get(amigo_id, []):
            if t.get("de") == user_id:
                ultimo_toque = max(ultimo_toque, t.get("hora", 0))

        if ultimo_toque > hoy_inicio:
            estado = "activa"
            dias_racha = calcular_dias_racha(user_id, amigo_id, hoy_inicio)
        elif ultimo_toque > hoy_inicio - 86400:
            estado = "pendiente"
            dias_racha = calcular_dias_racha(user_id, amigo_id, hoy_inicio)
        elif ultimo_toque > 0:
            estado = "rota"
            dias_racha = 0
        else:
            estado = "nueva"
            dias_racha = 0

        amigos_completo.append({
            "id": amigo_id,
            "nombre": perfil.get("nombre", "Amigo"),
            "avatar": perfil.get("avatar", "👤"),
            "racha_dias": dias_racha,
            "racha_estado": estado
        })

    return jsonify(ok=True, amigos=amigos_completo)
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify(ok=True, status="running", version="1.1.0")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Tokeji iniciando en puerto {port}")
    app.run(host="0.0.0.0", port=port)
