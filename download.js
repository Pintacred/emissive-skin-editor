
// get emissiveCanvas data from other 
const canvas = window.sharedData.canvas;
const ctx = canvas.getContext('2d');


const canvas2 = document.createElement('canvas');
canvas2.id = 'canvas2';
canvas2.width = 64; canvas2.height = 64;
const ctx2 = canvas2.getContext('2d');
// document.body.append(canvas2);


const canvasToBePackIcon = window.sharedData.canvasToBePackIcon;

const canvasPackIcon = document.createElement('canvas');
canvasPackIcon.width = 8; canvasPackIcon.height = 8;
const ctxPackIcon = canvasPackIcon.getContext('2d');


const programVersion = window.sharedData.programVersion;


const downloadBtn = document.getElementById('downloadBtn');
downloadBtn.addEventListener('click', function () {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;

	ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const a = data[i + 3];
		if (a == 0 || (r == 0 && g == 0 && b == 0)) {
			data[i + 3] = 0;  // Make pixel transparent if pixel is purely black or already transparent
		}
	}
	ctx2.putImageData(imageData, 0, 0);

	ctxPackIcon.clearRect(0, 0, canvasPackIcon.width, canvasPackIcon.height);
	ctxPackIcon.drawImage(canvasToBePackIcon, 8, 8, 8, 8, 0, 0, 8, 8);
	ctxPackIcon.drawImage(canvasToBePackIcon, 40, 8, 8, 8, 0, 0, 8, 8);

	// Generating a random 5-digit number so when people download them, the pack is easy to find, as every name will be unique
	const packIdentification = Math.floor(Math.random() * 90000) + 10000;
	// console.log(packIdentification);

	const zip = createTheWholeThing(canvas2, canvasPackIcon, packIdentification);

	// Generate and download
	zip.generateAsync({ type: "blob" }).then(function (content) {
		const link = document.createElement('a');
		link.href = URL.createObjectURL(content);
		link.download = `custom_emissive_skin_${programVersion}_${packIdentification}.mcpack`;
		link.click();
	});
});


// This part of the code is beyond horror
function createTheWholeThing(canvas, canvas2, packIdentification) {
	// convert image to base64Data to be used in putting image in zip
	const dataURL = canvas.toDataURL("image/png");
	const base64Data = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

	// converts
	const dataURLPackIcon = canvas2.toDataURL("image/png");
	const base64DataPackIcon = dataURLPackIcon.replace(/^data:image\/(png|jpg);base64,/, "");

	// create new zip, then put all other contents
	const zip = new JSZip();

	zip.file("entity/player.entity.json",
		`
{
  "format_version": "1.10.0",
  "minecraft:client_entity": {
    "description": {
      "identifier": "minecraft:player",
      "materials": {
        "default": "entity_alphatest",
        "cape": "entity_alphatest",
        "animated": "player_animated",
        "spectator": "player_spectator",
        "player_emissive": "entity_alphablend"
      },
      "textures": {
        "default": "textures/entity/steve",
        "cape": "textures/entity/cape_invisible",
        "emissive_skin_texture": "textures/entity/emissive_skin_texture"
      },
      "geometry": {
        "default": "geometry.humanoid.custom",
        "custom_emissive_geo": "geometry.player.custom_emissive"
      },
      "scripts": {
        "scale": "0.9375",
        "initialize": [
          "variable.is_holding_right = 0.0;",
          "variable.is_blinking = 0.0;",
          "variable.last_blink_time = 0.0;",
          "variable.hand_bob = 0.0;"
        ],
        "pre_animation": [
          "variable.helmet_layer_visible = 1.0;",
          "variable.leg_layer_visible = 1.0;",
          "variable.boot_layer_visible = 1.0;",
          "variable.chest_layer_visible = 1.0;",
          "variable.attack_body_rot_y = Math.sin(360*Math.sqrt(variable.attack_time)) * 5.0;",
          "variable.tcos0 = (math.cos(query.modified_distance_moved * 38.17) * query.modified_move_speed / variable.gliding_speed_value) * 57.3;",
          "variable.first_person_rotation_factor = math.sin((1 - variable.attack_time) * 180.0);",
          "variable.hand_bob = query.life_time < 0.01 ? 0.0 : variable.hand_bob + ((query.is_on_ground && query.is_alive ? math.clamp(math.sqrt(math.pow(query.position_delta(0), 2.0) + math.pow(query.position_delta(2), 2.0)), 0.0, 0.1) : 0.0) - variable.hand_bob) * 0.02;",
          "variable.map_angle = math.clamp(1 - variable.player_x_rotation / 45.1, 0.0, 1.0);",
          "variable.item_use_normalized = query.main_hand_item_use_duration / query.main_hand_item_max_duration;"
        ],
        "animate": [
          "root"
        ]
      },
      "animations": {
        "root": "controller.animation.player.root",
        "base_controller": "controller.animation.player.base",
        "hudplayer": "controller.animation.player.hudplayer",
        "humanoid_base_pose": "animation.humanoid.base_pose",
        "look_at_target": "controller.animation.humanoid.look_at_target",
        "look_at_target_ui": "animation.player.look_at_target.ui",
        "look_at_target_default": "animation.humanoid.look_at_target.default",
        "look_at_target_gliding": "animation.humanoid.look_at_target.gliding",
        "look_at_target_swimming": "animation.humanoid.look_at_target.swimming",
        "look_at_target_inverted": "animation.player.look_at_target.inverted",
        "move.arms": "animation.player.move.arms",
        "move.legs": "animation.player.move.legs",
        "swimming": "animation.player.swim",
        "swimming.legs": "animation.player.swim.legs",
        "riding.arms": "animation.player.riding.arms",
        "riding.legs": "animation.player.riding.legs",
        "holding": "animation.player.holding",
        "brandish_spear": "animation.humanoid.brandish_spear",
        "charging": "animation.humanoid.charging",
        "attack.positions": "animation.player.attack.positions",
        "attack.rotations": "animation.player.attack.rotations",
        "sneaking": "animation.player.sneaking",
        "bob": "animation.player.bob",
        "damage_nearby_mobs": "animation.humanoid.damage_nearby_mobs",
        "bow_and_arrow": "animation.humanoid.bow_and_arrow",
        "use_item_progress": "animation.humanoid.use_item_progress",
        "skeleton_attack": "animation.skeleton.attack",
        "sleeping": "animation.player.sleeping",
        "first_person_base_pose": "animation.player.first_person.base_pose",
        "first_person_empty_hand": "animation.player.first_person.empty_hand",
        "first_person_swap_item": "animation.player.first_person.swap_item",
        "first_person_attack_controller": "controller.animation.player.first_person_attack",
        "first_person_attack_rotation": "animation.player.first_person.attack_rotation",
        "first_person_attack_rotation_item": "animation.player.first_person.attack_rotation_item",
        "first_person_vr_attack_rotation": "animation.player.first_person.vr_attack_rotation",
        "first_person_walk": "animation.player.first_person.walk",
        "first_person_map_controller": "controller.animation.player.first_person_map",
        "first_person_map_hold": "animation.player.first_person.map_hold",
        "first_person_map_hold_attack": "animation.player.first_person.map_hold_attack",
        "first_person_map_hold_off_hand": "animation.player.first_person.map_hold_off_hand",
        "first_person_map_hold_main_hand": "animation.player.first_person.map_hold_main_hand",
        "first_person_crossbow_equipped": "animation.player.first_person.crossbow_equipped",
        "first_person_crossbow_hold": "animation.player.first_person.crossbow_hold",
        "first_person_breathing_bob": "animation.player.first_person.breathing_bob",
        "third_person_crossbow_equipped": "animation.player.crossbow_equipped",
        "third_person_bow_equipped": "animation.player.bow_equipped",
        "crossbow_hold": "animation.player.crossbow_hold",
        "crossbow_controller": "controller.animation.player.crossbow",
        "shield_block_main_hand": "animation.player.shield_block_main_hand",
        "shield_block_off_hand": "animation.player.shield_block_off_hand",
        "blink": "controller.animation.persona.blink",
        "fishing_rod": "animation.humanoid.fishing_rod",
        "holding_spyglass": "animation.humanoid.holding_spyglass",
        "first_person_shield_block": "animation.player.first_person.shield_block",
        "tooting_goat_horn": "animation.humanoid.tooting_goat_horn",
        "holding_brush": "animation.humanoid.holding_brush",
        "brushing": "animation.humanoid.brushing",
        "crawling": "animation.player.crawl",
        "crawling.legs": "animation.player.crawl.legs"
      },
      "render_controllers": [
        {
          "controller.render.player.first_person_spectator": "variable.is_first_person && query.is_spectator"
        },
        {
          "controller.render.player.third_person_spectator": "!variable.is_first_person && !variable.map_face_icon && query.is_spectator"
        },
        {
          "controller.render.player.first_person": "variable.is_first_person && !query.is_spectator"
        },
        {
          "controller.render.player.third_person": "!variable.is_first_person && !variable.map_face_icon && !query.is_spectator"
        },
        {
          "controller.render.player.map": "variable.map_face_icon"
        },
        "controller.render.player.custom_emissive"
      ],
      "enable_attachables": true
    }
  }
}
        `
	);

	zip.file("render_controllers/player_custom_emissive.render_controllers.json",
		`
{
  "format_version": "1.8.0",
  "render_controllers": {
    "controller.render.player.custom_emissive": {
      "geometry": "Geometry.custom_emissive_geo",
      "materials": [ { "*": "Material.player_emissive" } ],
      "textures": [ "texture.emissive_skin_texture" ],
      "ignore_lighting": true,
      "part_visibility" : [
        {"*": "query.is_local_player"},
        {"leftArm": "variable.is_first_person && !query.is_spectator && query.is_item_name_any('slot.weapon.mainhand', 0, '') || query.is_item_name_any('slot.weapon.mainhand', 0, 'minecraft:filled_map')"},
        {"rightArm": "variable.is_first_person && !query.is_spectator && query.is_item_name_any('slot.weapon.offhand', 0, '') || query.is_item_name_any('slot.weapon.offhand', 0, 'minecraft:filled_map')"}
      ]

    }
  }
}
        `
	);

	zip.file("subpacks/slim/models/entity/player_custom_emissive.json",
		`
{
	"format_version": "1.12.0",
	"minecraft:geometry": [
		{
			"description": {
				"identifier": "geometry.player.custom_emissive",
				"texture_width": 64,
				"texture_height": 64,
				"visible_bounds_width": 3,
				"visible_bounds_height": 3,
				"visible_bounds_offset": [0, 1.5, 0]
			},
			"bones": [
				{
					"name": "root",
					"pivot": [0, 0, 0]
				},
				{
					"name": "waist",
					"parent": "root",
					"pivot": [0, 12, 0]
				},
				{
					"name": "body",
					"parent": "waist",
					"pivot": [0, 24, 0],
					"cubes": [
						{"origin": [-4, 12, -2], "size": [8, 12, 4], "inflate": 0.005, "uv": [16, 16]}
					]
				},
				{
					"name": "head",
					"parent": "body",
					"pivot": [0, 24, 0],
					"cubes": [
						{"origin": [-4, 24, -4], "size": [8, 8, 8], "inflate": 0.005, "uv": [0, 0]}
					]
				},
				{
					"name": "hat",
					"parent": "head",
					"pivot": [0, 24, 0],
					"cubes": [
						{"origin": [-4, 24, -4], "size": [8, 8, 8], "inflate": 0.505, "uv": [32, 0]}
					]
				},
				{
					"name": "leftArm",
					"parent": "body",
					"pivot": [5, 21.5, 0],
					"cubes": [
						{"origin": [4, 11.5, -2], "size": [3, 12, 4], "inflate": 0.005, "uv": [32, 48]}
					]
				},
				{
					"name": "leftSleeve",
					"parent": "leftArm",
					"pivot": [5, 21.5, 0],
					"cubes": [
						{"origin": [4, 11.5, -2], "size": [3, 12, 4], "inflate": 0.255, "uv": [48, 48]}
					]
				},
				{
					"name": "leftItem",
					"parent": "leftArm",
					"pivot": [6, 14.5, 1]
				},
				{
					"name": "rightArm",
					"parent": "body",
					"pivot": [-5, 21.5, 0],
					"cubes": [
						{"origin": [-7, 11.5, -2], "size": [3, 12, 4], "inflate": 0.005, "uv": [40, 16]}
					]
				},
				{
					"name": "rightSleeve",
					"parent": "rightArm",
					"pivot": [-5, 21.5, 0],
					"cubes": [
						{"origin": [-7, 11.5, -2], "size": [3, 12, 4], "inflate": 0.255, "uv": [40, 32]}
					]
				},
				{
					"name": "rightItem",
					"parent": "rightArm",
					"pivot": [-6, 14.5, 1],
					"locators": {
						"lead_hold": [-6, 14.5, 1]
					}
				},
				{
					"name": "jacket",
					"parent": "body",
					"pivot": [0, 24, 0],
					"cubes": [
						{"origin": [-4, 12, -2], "size": [8, 12, 4], "inflate": 0.255, "uv": [16, 32]}
					]
				},
				{
					"name": "cape",
					"parent": "body",
					"pivot": [0, 24, -3]
				},
				{
					"name": "rightLeg",
					"parent": "root",
					"pivot": [-1.9, 12, 0],
					"cubes": [
						{"origin": [-3.9, 0, -2], "size": [4, 12, 4], "inflate": 0.005, "uv": [0, 16]}
					]
				},
				{
					"name": "rightPants",
					"parent": "rightLeg",
					"pivot": [-1.9, 12, 0],
					"cubes": [
						{"origin": [-3.9, 0, -2], "size": [4, 12, 4], "inflate": 0.255, "uv": [0, 32]}
					]
				},
				{
					"name": "leftLeg",
					"parent": "root",
					"pivot": [1.9, 12, 0],
					"mirror": true,
					"cubes": [
						{"origin": [-0.1, 0, -2], "size": [4, 12, 4], "inflate": 0.005, "uv": [16, 48]}
					]
				},
				{
					"name": "leftPants",
					"parent": "leftLeg",
					"pivot": [1.9, 12, 0],
					"cubes": [
						{"origin": [-0.1, 0, -2], "size": [4, 12, 4], "inflate": 0.255, "uv": [0, 48]}
					]
				}
			]
		}
	]
}
		`
	);

	zip.file("subpacks/wide/models/entity/player_custom_emissive.json",
		`
{
	"format_version": "1.12.0",
	"minecraft:geometry": [
		{
			"description": {
				"identifier": "geometry.player.custom_emissive",
				"texture_width": 64,
				"texture_height": 64,
				"visible_bounds_width": 3,
				"visible_bounds_height": 3,
				"visible_bounds_offset": [0, 1.5, 0]
			},
			"bones": [
				{
					"name": "root",
					"pivot": [0, 0, 0]
				},
				{
					"name": "waist",
					"parent": "root",
					"pivot": [0, 12, 0]
				},
				{
					"name": "body",
					"parent": "waist",
					"pivot": [0, 24, 0],
					"cubes": [
						{"origin": [-4, 12, -2], "size": [8, 12, 4], "inflate": 0.005, "uv": [16, 16]}
					]
				},
				{
					"name": "head",
					"parent": "body",
					"pivot": [0, 24, 0],
					"cubes": [
						{"origin": [-4, 24, -4], "size": [8, 8, 8], "inflate": 0.005, "uv": [0, 0]}
					]
				},
				{
					"name": "hat",
					"parent": "head",
					"pivot": [0, 24, 0],
					"cubes": [
						{"origin": [-4, 24, -4], "size": [8, 8, 8], "inflate": 0.505, "uv": [32, 0]}
					]
				},
				{
					"name": "cape",
					"parent": "body",
					"pivot": [0, 24, 3]
				},
				{
					"name": "leftArm",
					"parent": "body",
					"pivot": [5, 22, 0],
					"cubes": [
						{"origin": [4, 12, -2], "size": [4, 12, 4], "inflate": 0.005, "uv": [32, 48]}
					]
				},
				{
					"name": "leftSleeve",
					"parent": "leftArm",
					"pivot": [5, 22, 0],
					"cubes": [
						{"origin": [4, 12, -2], "size": [4, 12, 4], "inflate": 0.255, "uv": [48, 48]}
					]
				},
				{
					"name": "leftItem",
					"parent": "leftArm",
					"pivot": [6, 15, 1]
				},
				{
					"name": "rightArm",
					"parent": "body",
					"pivot": [-5, 22, 0],
					"cubes": [
						{"origin": [-8, 12, -2], "size": [4, 12, 4], "inflate": 0.005, "uv": [40, 16]}
					]
				},
				{
					"name": "rightSleeve",
					"parent": "rightArm",
					"pivot": [-5, 22, 0],
					"cubes": [
						{"origin": [-8, 12, -2], "size": [4, 12, 4], "inflate": 0.255, "uv": [40, 32]}
					]
				},
				{
					"name": "rightItem",
					"parent": "rightArm",
					"pivot": [-6, 15, 1],
					"locators": {
						"lead_hold": [-6, 15, 1]
					}
				},
				{
					"name": "jacket",
					"parent": "body",
					"pivot": [0, 24, 0],
					"cubes": [
						{"origin": [-4, 12, -2], "size": [8, 12, 4], "inflate": 0.255, "uv": [16, 32]}
					]
				},
				{
					"name": "leftLeg",
					"parent": "root",
					"pivot": [1.9, 12, 0],
					"cubes": [
						{"origin": [-0.1, 0, -2], "size": [4, 12, 4], "inflate": 0.005, "uv": [16, 48]}
					]
				},
				{
					"name": "leftPants",
					"parent": "leftLeg",
					"pivot": [1.9, 12, 0],
					"cubes": [
						{"origin": [-0.1, 0, -2], "size": [4, 12, 4], "inflate": 0.255, "uv": [0, 48]}
					]
				},
				{
					"name": "rightLeg",
					"parent": "root",
					"pivot": [-1.9, 12, 0],
					"cubes": [
						{"origin": [-3.9, 0, -2], "size": [4, 12, 4], "inflate": 0.005, "uv": [0, 16]}
					]
				},
				{
					"name": "rightPants",
					"parent": "rightLeg",
					"pivot": [-1.9, 12, 0],
					"cubes": [
						{"origin": [-3.9, 0, -2], "size": [4, 12, 4], "inflate": 0.255, "uv": [0, 32]}
					]
				}
			]
		}
	]
}
		`
	);

	zip.file("textures/entity/emissive_skin_texture.png", base64Data, { base64: true });


	const description = `Makes parts of your skin \"glow\" like enderman eyes.\\n\\nMade by Pintacred.\\n\\nID: ${packIdentification}.`

	zip.file("manifest.json",
		`
        {
            "format_version": 2,
            "header": {
                "description": "${description}",
                "name": "Emissive Player Skin (${programVersion})",
                "uuid": "${crypto.randomUUID()}",
                "version": [ 0, 0, 1],
                "min_engine_version": [ 1, 21, 0 ]
            },
            "modules": [
                {
                    "description": "${description}",
                    "type": "resources",
                    "uuid": "${crypto.randomUUID()}",
                    "version": [0, 0, 1  ]
                }
            ],
            "subpacks": [
				{
                    "folder_name": "slim",
                    "name": "Slim Arms (3x)",
                    "memory_tier": 0
                },
                {
                    "folder_name": "wide",
                    "name": "Wide Arms (4x)",
                    "memory_tier": 0
                }
            ]
        }
        `
	);

	zip.file("pack_icon.png", base64DataPackIcon, { base64: true });

	return zip;
}

