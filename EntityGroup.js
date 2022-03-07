class EntityGroup {
    constructor(scene, center, radius, time_per_day) {
        this.data = []
        this.types = []
        this.entities = []
        this.count = {}
        this.prototype = {}
        this.scene = scene;
        this.center = center;
        this.radius = radius;
        this.background_str = "";
        this.background = new THREE.Color("#ffffff");
        this.background_target = new THREE.Color("#ffffff");
        this.day = 0;
        this.dt = time_per_day;
        this.audios = []
        this.initText();

        this.default_text = '';

        AFRAME.registerComponent('hover', {
            init() {
                
                this.el.addEventListener('mouseenter', function () {
                    var type = this.attributes.type.nodeValue;
                    group.showEntityText(type);

                });
                this.el.addEventListener('mouseleave', function () {
                    // group.hideEntityText();
                    group.showDefaultText();
                });
            }
        });
    }

    GetRandomRotation () {
        let r = new THREE.Vector3(Math.random()*360,Math.random()*360,Math.random()*360);
        
        return r;
    }
    
    // GetRandomPosition (c, r) {
    //     let d = new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5);
        
    //     let l = Math.random() * r;
    //     d = d.clampLength(l, l);
    //     d = d.add(c);
    
    //     return d;
    // }
    
    GetRandomPosition (c, r) {
        let x = (Math.random()-.5) * r;
        let y = (Math.random()-.5) * r;
        let z = (Math.random()-.5) * r;
    
        let p = new THREE.Vector3(x,y,z);
    
        return p;
    }

    createPrototype(type, model_path, scale, radius) {
        this.prototype[type] = {}
        this.prototype[type].model_path = model_path;
        this.prototype[type].scale = scale;
        this.prototype[type].radius = radius;

        this.count[type] = 0;
    }

    clone(object) {
        return JSON.parse(JSON.stringify(object))
    }

    addEntity(type) {
        let prototype = this.prototype[type];
        var entity = new Entity(
            type, 
            prototype.model_path, 
            this.GetRandomPosition(this.center, this.radius),
            this.GetRandomRotation(),
            prototype.scale,
            prototype.radius
        );

        this.scene.appendChild(entity.element);
        this.entities.push(entity);
        this.count[type] += 1;
    }

    removeEntity(type) {
        for(let i=0; i<this.entities.length; i++) {
            if(this.entities[i].type == type) {
                this.scene.removeChild(this.entities[i].element);
                this.entities.splice(i, 1);
                this.count[type] -= 1;
                break;
            }
        }
    }

    changeBackgroundColor(color) {
        this.background_target = new THREE.Color(color);
        this.smoothChangeSceneColor(this.background, this.background_target,0,60);
    }

    updateBackgroundColor() {
        this.background = this.background.lerp(this.background_target, 0.1);
        var color_str = '#'+this.background.getHexString();
        group.scene.setAttributeNS(null, "fog", "type:linear;color:"+color_str+";far: 15; near: 0");
        group.scene.setAttributeNS(null, "background", "color:"+color_str);
    }

    changeSceneColor(color) {
        group.scene.setAttributeNS(null, "fog", "type:linear;color:"+color+";far: 15; near: 0");
        group.scene.setAttributeNS(null, "background", "color:"+color); 
    }

    smoothChangeSceneColor(a, b, iter, max) {
        var color = a.lerp(b, iter/max).getHexString();
        // console.log(color);
        this.changeSceneColor("#"+color);

        if(iter<max && !a.equals(b)) {
            setTimeout(() => {
                this.smoothChangeSceneColor(a,b,iter+1,max);
            },1000/60);
        }
    }

    tick(time) {
        if(Math.floor(time/this.dt)==this.day+1) {
            this.day += 1;
            this.newDay();
        }
    }

    async updateEntities() {
        let row = this.data[this.day];
        this.types.forEach(type => {
            let diff = row[type]*1 - this.count[type];

            for(let i=0; i<Math.abs(diff); i++) {
                if(diff > 0) {
                    this.addEntity(type);
                }

                if(diff < 0) {
                    this.removeEntity(type);
                }
            }
        });
    }

    newDay() {
        if(this.day >= this.data.length) {
            return 0;
        }

        if(this.data[this.day]["background"] != this.background_str) {
            this.background_str = this.data[this.day]["background"];
            this.changeBackgroundColor(this.data[this.day]["background"]);
        }
        
        this.text.setAttributeNS(null, "value", "Day "+(this.day+1));
        this.text.setAttributeNS(null, "visible", true);

        this.updateEntities();

        if(this.day == 0) {
            this.playAudio('3.1');
            this.default_text = "The first stage of fermentation generates an acidic environment, bringing the acid content (PH) of the product to a range of 0.6 to 0.8 percent.";
            // this.text.setAttributeNS(null, "value", "The first stage of fermentation generates an acidic environment, bringing the acid content (PH) of the product to a range of 0.6 to 0.8 percent.");
            // this.text.setAttributeNS(null, "visible", true);
        } else if(this.day == 5) {
            this.playAudio('3.2');
            this.default_text = "During the second stage of fermentation, the acid content will be further increased and the pH will drop to 1.4-1.6%.";
            // this.text.setAttributeNS(null, "value", "During the second stage of fermentation, the acid content will be further increased and the pH will drop to 1.4-1.6%.");
            // this.text.setAttributeNS(null, "visible", true);
        } else if(this.day == 26) {
            this.playAudio('3.3');
            this.default_text = "At the end of the fermentation process, the pH will drop to 1.0%.";
            // this.text.setAttributeNS(null, "value", "At the end of the fermentation process, the pH will drop to 1.0%.");
            // this.text.setAttributeNS(null, "visible", true);
        } else if(this.day == 28) {
            this.playAudio('3.4');
            this.default_text = "";
            // this.text.setAttributeNS(null, "value", "");
            // this.text.setAttributeNS(null, "visible", false);
        }
    }

    playAudio(name) {
        if(this.audios[name].played==false) {
            this.audios[name].audio.pause();
            this.audios[name].audio.play();
            this.audios[name].played = true;
            console.log(name);
        }
    }



    initText() {
        var screen_cam = document.createElement("a-camera");
        var screen_box = document.createElement("a-entity");
        screen_box.setAttributeNS(null, "position", "0 0 4");
        var text = document.createElement("a-text");
        text.setAttributeNS(null, "value", "abc");
        text.setAttributeNS(null, "position", "5 3 -5");
        text.setAttributeNS(null, "text", "align:center;width:5;opacity:1");
        text.setAttributeNS(null, "geometry", "width:3.5; primitive:plane");
        text.setAttributeNS(null, "material", "opacity:0.11;color:#000000");
        text.setAttributeNS(null, "visible", false);
        screen_cam.appendChild(text);

        var e_text = document.createElement("a-text");
        e_text.setAttributeNS(null, "value", "");
        e_text.setAttributeNS(null, "position", "0 -3 -5");
        e_text.setAttributeNS(null, "text", "align:center;width:3;opacity:1");
        e_text.setAttributeNS(null, "geometry", "width:6.5; primitive:plane");
        e_text.setAttributeNS(null, "material", "opacity:0.11;color:#000000");
        e_text.setAttributeNS(null, "visible", false);
        screen_cam.appendChild(e_text);

        screen_box.appendChild(screen_cam);

        this.screen_box = screen_box;
        this.screen_cam = screen_cam;

        this.cursor = document.createElement('a-cursor');
        this.screen_cam.appendChild(this.cursor);

        this.text = text;
        this.e_text = e_text;
        this.scene.appendChild(this.screen_box);
    }

    addAudio(name, path) {
        var audio = new Audio(path);
        this.audios[name] = {};
        this.audios[name].audio = audio;
        this.audios[name].played = false;
    }

    showEntityText(type) {
        this.e_text.setAttributeNS(null, "value", this.type_text[type]);
        this.e_text.setAttributeNS(null, "visible", true);
    }

    hideEntityText() {
        this.e_text.setAttributeNS(null, "value", '');
        this.e_text.setAttributeNS(null, "visible", false);
    }

    showDefaultText() {
        if(this.default_text == '') {
            this.e_text.setAttributeNS(null, "visible", false);
        } else {
            this.e_text.setAttributeNS(null, "value", this.default_text);
            this.e_text.setAttributeNS(null, "visible", true);
        }
    }
}
