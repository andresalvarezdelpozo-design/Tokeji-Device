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
            "encuestas": [],
            "votos_encuesta": {},
            "eventos": []
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
            "encuestas": encuestas,
            "votos_encuesta": votos_encuesta,
            "eventos": eventos
        }, f)

datos = cargar_datos()
toques_por_usuario = datos["toques_por_usuario"]
toques_recibidos = datos["toques_recibidos"]
respuestas_recibidas = datos.get("respuestas_recibidas", {})
desafios_pendientes = datos["desafios_pendientes"]
combates_finalizados = datos.get("combates_finalizados", [])
perfiles = datos.get("perfiles", {})
encuestas = datos.get("encuestas", [])
votos_encuesta = datos.get("votos_encuesta", {})
eventos = datos.get("eventos", [])


def inicio_dia_ts(ts=None):
    ahora = int(ts or time.time())
    return ahora - (ahora % 86400)


def log_event(event_type, **payload):
    evento = {"type": event_type, "ts": int(time.time())}
    evento.update(payload)
    eventos.append(evento)
    limite = int(time.time()) - (14 * 86400)
    eventos[:] = [e for e in eventos if e.get("ts", 0) >= limite]


def eventos_hoy(filtro=None):
    ini = inicio_dia_ts()
    out = [e for e in eventos if e.get("ts", 0) >= ini]
    if filtro:
        out = [e for e in out if filtro(e)]
    return out


def etiqueta_banda(valor):
    if valor <= 0:
        return ""
    if valor <= 2:
        return "alguien"
    if valor <= 6:
        return "varios"
    if valor <= 15:
        return "muchos"
    return "demasiados"


def resumen_home_user(user_id):
    ini = inicio_dia_ts()
    ev_hoy = [e for e in eventos if e.get("ts", 0) >= ini]
    recibidas = [e for e in ev_hoy if e.get("to") == user_id and e.get("type") in ["survey_vote", "anonymous_signal", "profile_view"]]
    fuertes = [e for e in recibidas if e.get("type") == "anonymous_signal"]
    encuesta = [e for e in ev_hoy if e.get("type") == "survey_vote" and e.get("from_user") == user_id]

    tokes_enviados = len([e for e in ev_hoy if e.get("type") == "toke_sent" and e.get("from_user") == user_id and e.get("channel") == "friends"])
    anon_enviados = len([e for e in ev_hoy if e.get("type") == "anonymous_signal" and e.get("from_user") == user_id and e.get("signal_type") == "anonimo"])
    crush_enviados = len([e for e in ev_hoy if e.get("type") == "anonymous_signal" and e.get("from_user") == user_id and e.get("signal_type") == "crush"])

    flags = {
        "survey_pending": len(encuesta) == 0,
        "has_signals_today": len(recibidas) > 0,
        "has_strong_signal_today": len(fuertes) > 0,
        "friends_tokes_left": max(0, 3 - tokes_enviados),
        "anon_left": max(0, 1 - anon_enviados),
        "crush_left": max(0, 1 - crush_enviados)
    }

    if flags["survey_pending"]:
        frase = "📊 Encuesta pendiente de hoy"
    elif flags["has_strong_signal_today"]:
        frase = "🤍 Has recibido una señal"
    elif flags["has_signals_today"]:
        frase = "👀 Hoy has sonado"
    elif flags["anon_left"] > 0:
        frase = f"🤍 Te quedan {flags['anon_left']} anónimos hoy"
    else:
        frase = "🔥 Tu curso está tranquilo por ahora"

    return {
        "frase": frase,
        "flags": flags,
        "signals_received_today": len(recibidas),
        "strong_signals_today": len(fuertes)
    }


def generar_encuesta_demo():
    ahora = int(time.time())
    return {
        "id": f"poll_{ahora}",
        "pregunta": "¿Quién reparte mejor vibra hoy?",
        "curso": "3º ESO",
        "instituto": "",
        "opciones": [
            "El/la que siempre anima 💪",
            "El/la de los memes 😂",
            "La mente estratégica 🧠",
            "Yo obvio 😎"
        ],
        "creada": ahora,
        "expira": ahora + 3600,
        "activa": True
    }


def asegurar_encuesta_activa(instituto=""):
    ahora = int(time.time())
    for encuesta in encuestas:
        if encuesta.get("activa") and encuesta.get("expira", 0) > ahora:
            if not instituto or encuesta.get("instituto", "") in ["", instituto]:
                return encuesta

    demo = generar_encuesta_demo()
    demo["instituto"] = instituto or ""
    encuestas.append(demo)
    guardar_datos()
    return demo


def cuotas_toke_hoy(user_id):
    ev_hoy = eventos_hoy(lambda e: e.get("from_user") == user_id)
    amigos = len([e for e in ev_hoy if e.get("type") == "toke_sent" and e.get("channel") == "friends"])
    anon = len([e for e in ev_hoy if e.get("type") == "anonymous_signal" and e.get("signal_type") == "anonimo"])
    crush = len([e for e in ev_hoy if e.get("type") == "anonymous_signal" and e.get("signal_type") == "crush"])
    return {
        "friends_left": max(0, 3 - amigos),
        "anon_left": max(0, 1 - anon),
        "crush_left": max(0, 1 - crush)
    }

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

        cuotas = cuotas_toke_hoy(de)
        es_secreto = tipo in ["anonimo", "crush"]
        if not es_secreto and cuotas["friends_left"] <= 0:
            return jsonify(ok=False, error="Límite diario de 3 tokes a amigos alcanzado", toques_restantes=0)
        if tipo == "anonimo" and cuotas["anon_left"] <= 0:
            return jsonify(ok=False, error="Ya usaste tu anónimo de hoy", toques_restantes=0)
        if tipo == "crush" and cuotas["crush_left"] <= 0:
            return jsonify(ok=False, error="Ya usaste tu crush anónimo de hoy", toques_restantes=0)

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
            "hora": int(time.time()),
            "tipo": tipo,
            "instituto_destino": instituto_destino
        })
        
        if tipo == "anonimo" or tipo == "crush":
            log_event("anonymous_signal", from_user=de, to=para, instituto=instituto_destino or "", signal_type=tipo)
        else:
            log_event("toke_sent", from_user=de, to=para, toke_id=num, channel="friends")

        guardar_datos()
        
        cuotas_post = cuotas_toke_hoy(de)
        toques_restantes = cuotas_post["friends_left"]
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
        
        log_event("toke_response", from_user=de, to=para, response=respuesta)
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
        user_id = data.get("userId", "").strip()
        provincia = data.get("provincia", "").strip()
        instituto = data.get("instituto", "").strip()
        curso = data.get("curso", "").strip()
        nombre = data.get("nombre", "Alumno")
        avatar = data.get("avatar", "👤")

        if not all([user_id, provincia, instituto, curso]):
            return jsonify(ok=False, error="Faltan datos requeridos"), 400

        perfiles[user_id] = {
            "provincia": provincia,
            "instituto": instituto,
            "curso": curso,
            "nombre": nombre,
            "avatar": avatar,
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
        user_id = request.args.get("userId", "").strip()
        curso = request.args.get("curso", "").strip()

        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400

        perfil = perfiles.get(user_id, {})
        instituto_usuario = perfil.get("instituto")
        if not instituto_usuario:
            return jsonify(ok=True, companeros=[])

        companeros = []
        for uid, p in perfiles.items():
            if uid == user_id:
                continue
            if p.get("instituto") != instituto_usuario:
                continue
            if curso and p.get("curso") != curso:
                continue

            companeros.append({
                "id": uid,
                "nombre": p.get("nombre", "Alumno"),
                "avatar": p.get("avatar", "👤"),
                "curso": p.get("curso", "")
            })

        return jsonify(ok=True, companeros=companeros)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/perfil-publico", methods=["GET"])
def perfil_publico():
    try:
        target_id = request.args.get("targetId", "").strip()
        if not target_id:
            return jsonify(ok=False, error="Falta targetId"), 400

        perfil = perfiles.get(target_id, {})
        todox = perfil.get("todox_visitados", []) or []
        todox_limpio = []
        for valor in todox:
            try:
                n = int(valor)
                if 1 <= n <= 150:
                    todox_limpio.append(n)
            except Exception:
                continue

        return jsonify(ok=True, perfil={
            "id": target_id,
            "nombre": perfil.get("nombre", "Alumno"),
            "avatar": perfil.get("avatar", "👤"),
            "curso": perfil.get("curso", ""),
            "instituto": perfil.get("instituto", ""),
            "todox_total": len(set(todox_limpio)),
            "todox": sorted(list(set(todox_limpio)))
        })
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500



@app.route("/perfil-sync", methods=["POST"])
def perfil_sync():
    try:
        data = request.get_json() or {}
        user_id = (data.get("userId") or "").strip()
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400

        actual = perfiles.get(user_id, {})
        nombre = (data.get("nombre") or actual.get("nombre") or "Alumno").strip() or "Alumno"
        avatar = (data.get("avatar") or actual.get("avatar") or "👤").strip() or "👤"
        provincia = (data.get("provincia") or actual.get("provincia") or "").strip()
        instituto = (data.get("instituto") or actual.get("instituto") or "").strip()
        curso = (data.get("curso") or actual.get("curso") or "").strip()

        todox_in = data.get("todox", [])
        todox_clean = []
        if isinstance(todox_in, list):
            for valor in todox_in:
                try:
                    n = int(valor)
                    if 1 <= n <= 150:
                        todox_clean.append(n)
                except Exception:
                    continue
        todox_clean = sorted(list(set(todox_clean)))

        perfiles[user_id] = {
            "provincia": provincia,
            "instituto": instituto,
            "curso": curso,
            "nombre": nombre,
            "avatar": avatar,
            "fecha_registro": actual.get("fecha_registro", int(time.time())),
            "todox_visitados": todox_clean if todox_clean else actual.get("todox_visitados", [])
        }

        guardar_datos()
        return jsonify(ok=True, todox_total=len(perfiles[user_id].get("todox_visitados", [])))
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/murmullo-stats", methods=["GET"])
def murmullo_stats():
    try:
        user_id = request.args.get("userId", "").strip()
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400

        perfil = perfiles.get(user_id, {})
        instituto = perfil.get("instituto", "")
        curso = perfil.get("curso", "")

        usuarios_instituto = [p for p in perfiles.values() if p.get("instituto") == instituto] if instituto else []
        conectados = max(5, len(usuarios_instituto) * 3)

        ahora = int(time.time())
        secretos_hoy = 0
        crush_hoy = 0
        for lista_toques in toques_recibidos.values():
            for t in lista_toques:
                if ahora - t.get("hora", 0) > 86400:
                    continue
                if instituto and t.get("instituto_destino") != instituto:
                    continue
                if t.get("tipo") == "crush":
                    crush_hoy += 1
                elif t.get("tipo") == "anonimo":
                    secretos_hoy += 1

        combates_hoy = len([c for c in combates_finalizados if ahora - c.get("timestamp", 0) < 86400])
        todox_hoy = sum(len(v.get("todox_visitados", [])) for v in perfiles.values() if (not instituto or v.get("instituto") == instituto))
        nuevos_hoy = len([p for p in perfiles.values() if ahora - p.get("fecha_registro", 0) < 86400 and (not instituto or p.get("instituto") == instituto)])

        return jsonify(ok=True, stats={
            "instituto": instituto or "Tu instituto",
            "curso": curso,
            "conectados": conectados,
            "secretos": secretos_hoy,
            "crushes": crush_hoy,
            "combates": combates_hoy,
            "todox": todox_hoy,
            "nuevos": nuevos_hoy,
            "headline": f"Tu curso está on fire: {crush_hoy} crush y {secretos_hoy} secretos hoy"
        })
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/encuestas/activa", methods=["GET"])
def encuesta_activa():
    try:
        user_id = request.args.get("userId", "").strip()
        instituto = perfiles.get(user_id, {}).get("instituto", "") if user_id else ""

        encuesta = asegurar_encuesta_activa(instituto)
        votos = votos_encuesta.get(encuesta["id"], {})
        total = len(votos)
        conteo = [0 for _ in encuesta.get("opciones", [])]

        for opcion in votos.values():
            if isinstance(opcion, int) and 0 <= opcion < len(conteo):
                conteo[opcion] += 1

        return jsonify(ok=True, encuesta={
            "id": encuesta["id"],
            "pregunta": encuesta["pregunta"],
            "curso": encuesta.get("curso", ""),
            "opciones": encuesta.get("opciones", []),
            "expira": encuesta.get("expira"),
            "total_votos": total,
            "resultados": conteo,
            "ya_votaste": bool(user_id and user_id in votos)
        })
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/encuestas/votar", methods=["POST"])
def votar_encuesta():
    try:
        data = request.get_json() or {}
        user_id = data.get("userId", "").strip()
        encuesta_id = data.get("encuestaId", "").strip()
        opcion = data.get("opcion")

        if not all([user_id, encuesta_id]) or opcion is None:
            return jsonify(ok=False, error="Faltan datos requeridos"), 400

        encuesta = next((e for e in encuestas if e.get("id") == encuesta_id), None)
        if not encuesta:
            return jsonify(ok=False, error="Encuesta no encontrada"), 404

        ahora = int(time.time())
        if encuesta.get("expira", 0) <= ahora:
            encuesta["activa"] = False
            guardar_datos()
            return jsonify(ok=False, error="Encuesta finalizada"), 400

        if not isinstance(opcion, int) or opcion < 0 or opcion >= len(encuesta.get("opciones", [])):
            return jsonify(ok=False, error="Opción inválida"), 400

        if encuesta_id not in votos_encuesta:
            votos_encuesta[encuesta_id] = {}

        votos_encuesta[encuesta_id][user_id] = opcion
        log_event("survey_vote", from_user=user_id, to=f"option_{opcion}", encuesta_id=encuesta_id)
        guardar_datos()

        votos = votos_encuesta.get(encuesta_id, {})
        conteo = [0 for _ in encuesta.get("opciones", [])]
        for op in votos.values():
            if isinstance(op, int) and 0 <= op < len(conteo):
                conteo[op] += 1

        return jsonify(ok=True, resultados=conteo, total_votos=len(votos))
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500



@app.route("/home-state", methods=["GET"])
def home_state():
    try:
        user_id = request.args.get("userId", "").strip()
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400

        perfil = perfiles.get(user_id, {})
        instituto = perfil.get("instituto", "")

        ev_hoy = eventos_hoy(lambda e: (not instituto) or e.get("instituto", "") in ["", instituto])
        c_survey = len([e for e in ev_hoy if e.get("type") == "survey_vote"])
        c_anon = len([e for e in ev_hoy if e.get("type") == "anonymous_signal"])
        c_views = len([e for e in ev_hoy if e.get("type") == "profile_view"])
        c_tokes = len([e for e in ev_hoy if e.get("type") == "toke_sent"])
        c_resp = len([e for e in ev_hoy if e.get("type") == "toke_response"])

        murmullo = []
        if c_survey > 0:
            murmullo.append(f"Hoy {etiqueta_banda(c_survey)} han dejado señal en encuesta")
        if c_anon > 0:
            murmullo.append(f"Hoy {etiqueta_banda(c_anon)} han enviado anónimos")
        if c_views > 0:
            murmullo.append(f"Hoy hubo {etiqueta_banda(c_views)} miradas en ToDox")
        if c_tokes > 0:
            murmullo.append(f"Hoy {etiqueta_banda(c_tokes)} han mandado tokes")
        if c_resp > 0:
            murmullo.append(f"Hoy {etiqueta_banda(c_resp)} han respondido tokes")

        personal = resumen_home_user(user_id)
        return jsonify(ok=True, home=personal, murmullo=murmullo[:5])
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify(ok=True, status="running", version="1.1.0")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Tokeji iniciando en puerto {port}")
    app.run(host="0.0.0.0", port=port)