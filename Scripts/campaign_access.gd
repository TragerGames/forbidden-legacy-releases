extends Node

const CampaignReleaseRulesScript = preload("res://Scripts/campaign_release_rules.gd")

const BUILD_VERSION : String = "BETA 1.4.1"
const FREE_LIMIT_NPC : String = CampaignReleaseRulesScript.FREE_CONTENT_LAST_NPC
const FULL_LIMIT_NPC : String = CampaignReleaseRulesScript.FULL_CONTENT_LAST_NPC
const PATH_HISTORIA : String = "res://Data/campanha/historia_campanha.json"

# DEBUG — set to false before any public build
const DEBUG_UNLOCK_CAMPAIGN : bool = false

var _historia_cache: Dictionary = {}

func evento_exige_licenca(capitulo_idx: int, evento_idx: int, historia: Dictionary) -> bool:
	if DEBUG_UNLOCK_CAMPAIGN:
		return false
	var capitulos: Array = historia.get("capitulos", [])
	if capitulo_idx < 0 or capitulo_idx >= capitulos.size():
		return false
	var limite := _localizar_evento_npc(FREE_LIMIT_NPC, historia)
	if limite.is_empty():
		return false
	var limite_capitulo := int(limite.get("capitulo_idx", -1))
	var limite_evento := int(limite.get("evento_idx", -1))
	return capitulo_idx > limite_capitulo \
		or (capitulo_idx == limite_capitulo and evento_idx > limite_evento)

func pode_acessar_evento(capitulo_idx: int, evento_idx: int, historia: Dictionary) -> bool:
	if not evento_exige_licenca(capitulo_idx, evento_idx, historia):
		return true
	return _tem_licenca_valida()

func npc_exige_licenca(npc_id: String, historia: Dictionary = {}) -> bool:
	var dados_historia := historia
	if dados_historia.is_empty():
		dados_historia = _carregar_historia()
	var pos := _localizar_evento_npc(npc_id, dados_historia)
	if pos.is_empty():
		return false
	return evento_exige_licenca(int(pos.get("capitulo_idx", 0)), int(pos.get("evento_idx", 0)), dados_historia)

func pode_acessar_npc(npc_id: String, historia: Dictionary = {}) -> bool:
	if not npc_exige_licenca(npc_id, historia):
		return true
	return _tem_licenca_valida()

func _tem_licenca_valida() -> bool:
	if has_node("/root/GameData") and GameData.has_method("tem_licenca_local_valida"):
		return GameData.tem_licenca_local_valida()
	if has_node("/root/LicenseManager"):
		if not LicenseManager._dados_licenca_ok():
			return false
		return LicenseManager.tem_licenca_valida()
	return false

func _indice_evento_npc(npc_id: String, eventos: Array) -> int:
	for i in range(eventos.size()):
		var evento: Dictionary = eventos[i]
		if evento.get("tipo", "") == "duelo" and str(evento.get("npc_id", "")) == npc_id:
			return i
	return -1

func _localizar_evento_npc(npc_id: String, historia: Dictionary) -> Dictionary:
	var capitulos: Array = historia.get("capitulos", [])
	for capitulo_idx in range(capitulos.size()):
		var eventos: Array = capitulos[capitulo_idx].get("eventos", [])
		for evento_idx in range(eventos.size()):
			var evento: Dictionary = eventos[evento_idx]
			if evento.get("tipo", "") == "duelo" and str(evento.get("npc_id", "")) == npc_id:
				return {"capitulo_idx": capitulo_idx, "evento_idx": evento_idx}
	return {}

func _carregar_historia() -> Dictionary:
	if not _historia_cache.is_empty():
		return _historia_cache
	if not FileAccess.file_exists(PATH_HISTORIA):
		return {}
	var f := FileAccess.open(PATH_HISTORIA, FileAccess.READ)
	if f == null:
		return {}
	var parsed: Variant = JSON.parse_string(f.get_as_text())
	f.close()
	if parsed is Dictionary:
		_historia_cache = parsed
		return _historia_cache
	return {}
