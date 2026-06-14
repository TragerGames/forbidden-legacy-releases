# game_language.gd - Singleton for managing game text translations
# Loads translations from CSV and provides access to translated strings

extends Node

# Language constants
const LANG_PT = 0
const LANG_EN = 1

# Current language (0 = PT, 1 = EN)
var current_language : int = LANG_PT

# Translation dictionary structure:
# translations[section][key] = translated_string
var translations : Dictionary = {}

func _ready() -> void:
	_load_translations()
	# Inicializa o idioma baseado no que o GameData carregou, sem forçar um novo save
	if has_node("/root/GameData"):
		var gd = get_node("/root/GameData")
		current_language = gd.idioma
		var loc = "en" if current_language == LANG_EN else "pt"
		TranslationServer.set_locale(loc)
	
	_create_version_watermark()
	if has_node("/root/LicenseManager") and not LicenseManager.license_changed.is_connected(_update_version_label):
		LicenseManager.license_changed.connect(_update_version_label)

var _version_root: HBoxContainer = null
var _version_tier_label: Label = null

func _create_version_watermark() -> void:
	var canvas := CanvasLayer.new()
	canvas.layer = 128  # High enough to be over UI
	canvas.name = "VersionCanvas"
	add_child(canvas)
	
	var fonte: Font = null
	if ResourceLoader.exists("res://Fontes/BankGothic Md BT.ttf"):
		fonte = load("res://Fontes/BankGothic Md BT.ttf") as Font
	
	_version_root = HBoxContainer.new()
	_version_root.name = "VersionWatermark"
	_version_root.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	_version_root.offset_left = 10
	_version_root.offset_top = -54
	_version_root.offset_bottom = -14
	_version_root.add_theme_constant_override("separation", 0)
	_version_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	canvas.add_child(_version_root)

	var painel_ver := PanelContainer.new()
	var st_ver := StyleBoxFlat.new()
	st_ver.bg_color = Color(0.05, 0.03, 0.01, 0.88)
	st_ver.set_border_width_all(1)
	st_ver.border_color = Color(0.30, 0.22, 0.10, 0.7)
	st_ver.border_width_right = 0
	st_ver.corner_radius_top_left = 4
	st_ver.corner_radius_bottom_left = 4
	st_ver.content_margin_left = 6.0
	st_ver.content_margin_right = 6.0
	st_ver.content_margin_top = 2.0
	st_ver.content_margin_bottom = 2.0
	painel_ver.add_theme_stylebox_override("panel", st_ver)
	_version_root.add_child(painel_ver)

	var lbl_ver := Label.new()
	lbl_ver.text = "BETA 1.4.1"
	lbl_ver.mouse_filter = Control.MOUSE_FILTER_IGNORE
	lbl_ver.add_theme_font_size_override("font_size", 11)
	lbl_ver.add_theme_color_override("font_color", Color(0.55, 0.48, 0.35, 1.0))
	if fonte:
		lbl_ver.add_theme_font_override("font", fonte)
	painel_ver.add_child(lbl_ver)

	var painel_tier := PanelContainer.new()
	painel_tier.name = "PainelTier"
	_version_root.add_child(painel_tier)

	_version_tier_label = Label.new()
	_version_tier_label.name = "VersionTierLabel"
	_version_tier_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_version_tier_label.add_theme_font_size_override("font_size", 11)
	if fonte:
		_version_tier_label.add_theme_font_override("font", fonte)
	painel_tier.add_child(_version_tier_label)
	
	_update_version_label()

func _update_version_label() -> void:
	if not is_instance_valid(_version_tier_label): return
	var status: String = "FREE"
	if has_node("/root/GameData") and GameData.has_method("tem_licenca_local_valida") and not GameData.tem_licenca_local_valida():
		status = "FREE"
	elif has_node("/root/LicenseManager"):
		status = LicenseManager.obter_status_marca()

	var painel_tier := _version_tier_label.get_parent() as PanelContainer
	if not is_instance_valid(painel_tier): return

	var st_tier := StyleBoxFlat.new()
	st_tier.bg_color = Color(0.05, 0.03, 0.01, 0.88)
	st_tier.set_border_width_all(1)
	st_tier.corner_radius_top_right = 4
	st_tier.corner_radius_bottom_right = 4
	st_tier.content_margin_left = 6.0
	st_tier.content_margin_right = 6.0
	st_tier.content_margin_top = 2.0
	st_tier.content_margin_bottom = 2.0

	if status.begins_with("FOUNDER") or status.begins_with("★"):
		_version_tier_label.text = "★ FOUNDER"
		_version_tier_label.add_theme_color_override("font_color", Color(0.95, 0.80, 0.2, 1.0))
		st_tier.border_color = Color(0.78, 0.58, 0.12, 1.0)
	else:
		_version_tier_label.text = "FREE"
		_version_tier_label.add_theme_color_override("font_color", Color(0.85, 0.42, 0.0, 1.0))
		st_tier.border_color = Color(0.75, 0.35, 0.0, 1.0)
	painel_tier.add_theme_stylebox_override("panel", st_tier)

func _load_translations() -> void:
	# Load translations from a raw text CSV. Godot imports .csv as translation
	# resources in Android exports, so the raw runtime table must use .txt.
	var csv_path : String = "res://Localizacao/traducoes.txt"
	if not FileAccess.file_exists(csv_path):
		csv_path = "res://Localizacao/traducoes.csv"
	if not FileAccess.file_exists(csv_path):
		push_error("Translation file not found: " + csv_path)
		return

	var file = FileAccess.open(csv_path, FileAccess.READ)
	var header : PackedStringArray = file.get_csv_line()

	# Find language column indices
	var pt_idx: int = -1
	var en_idx: int = -1
	var key_idx: int = -1

	for i in range(header.size()):
		match header[i]:
			"pt":
				pt_idx = i
			"en":
				en_idx = i
			"keys":
				key_idx = i

	if key_idx == -1 or pt_idx == -1 or en_idx == -1:
		push_error("Invalid translation CSV format")
		return

	# Read all translations
	while not file.eof_reached():
		var row : PackedStringArray = file.get_csv_line()
		if row.size() <= max(key_idx, pt_idx, en_idx):
			continue

		var key : String = row[key_idx].strip_edges()
		var pt_value : String = row[pt_idx].strip_edges()
		var en_value : String = row[en_idx].strip_edges()

		if key == "":
			continue

		# Determine section from key prefix
		var section : String = "general"
		if key.begins_with("KEY_"):
			section = "keys"
		elif key.begins_with("MENU_"):
			section = "menu"
		elif key.begins_with("DUELO_"):
			section = "duelo"
		elif key.begins_with("DECK_"):
			section = "deck"
		elif key.begins_with("CARD_"):
			section = "card"
		elif key.begins_with("SHOP_"):
			section = "shop"
		elif key.begins_with("OPTIONS_"):
			section = "options"

		# Initialize section if needed
		if not translations.has(section):
			translations[section] = {}

		# Store translations
		translations[section][key] = {
			"pt": pt_value,
			"en": en_value
		}

	file.close()
	print("GameLanguage: Loaded translations for %d sections" % translations.size())

func get_text(section: String, key: String) -> String:
	if not translations.has(section):
		push_warning("Translation section not found: " + section)
		return key

	var section_dict : Dictionary = translations[section]
	if not section_dict.has(key):
		push_warning("Translation key not found: " + section + "." + key)
		return key

	var lang_dict : Dictionary = section_dict[key]
	var lang_key : String = "pt" if current_language == LANG_PT else "en"
	return lang_dict.get(lang_key, key)

# Convenience properties for direct access (matches original deck_building.gd expectations)
var deck_building : Dictionary:
	get:
		var dict : Dictionary = {}
		if translations.has("deck"):
			var section : Dictionary = translations["deck"]
			for key in section.keys():
				dict[key] = section[key]["pt"] if current_language == LANG_PT else section[key]["en"]
		return dict

var system : Dictionary:
	get:
		var dict : Dictionary = {}
		if translations.has("keys"):
			var section : Dictionary = translations["keys"]
			for key in section.keys():
				if key.begins_with("KEY_"):  # Only system keys
					dict[key] = section[key]["pt"] if current_language == LANG_PT else section[key]["en"]
		return dict

# Change language
func set_language(lang: int) -> void:
	if lang == LANG_PT or lang == LANG_EN:
		current_language = lang
		# Sync with Godot
		var loc = "en" if lang == LANG_EN else "pt"
		TranslationServer.set_locale(loc)
		
		_update_version_label()
		
		# Save preference via GameData
		if has_node("/root/GameData"):
			var gd = get_node("/root/GameData")
			gd.idioma = current_language
			gd.salvar()
	else:
		push_warning("Invalid language code: " + str(lang))

# Get current language
func get_language() -> int:
	return current_language

# Is current language Portuguese?
func is_portuguese() -> bool:
	return current_language == LANG_PT

# Is current language English?
func is_english() -> bool:
	return current_language == LANG_EN
