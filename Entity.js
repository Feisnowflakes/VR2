class Entity {
    constructor(type, model_path, position, rotation, scale, radius) {
        this.type = type;
        this.model_path = model_path;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.radius = radius;

        this.velocity = new THREE.Vector3(0,0,0);

        String.prototype.format = function () {
            var i = 0, args = arguments;
            return this.replace(/{}/g, function () {
                return typeof args[i] != 'undefined' ? args[i++] : '';
            });
        };

        // console.log(this);

        this.element = document.createElement("a-entity");
        this.element.setAttributeNS(null, "gltf-model", this.model_path);
        this.element.setAttributeNS(null, "rotation", "{} {} {}".format(this.rotation.x, this.rotation.y, this.rotation.z));
        this.element.setAttributeNS(null, "position", "{} {} {}".format(this.position.x, this.position.y, this.position.z));
        this.element.setAttributeNS(null, "scale", "{} {} {}".format(this.scale, this.scale, this.scale));
        this.element.setAttributeNS(null, "hover", "");
        this.element.setAttributeNS(null, "type", this.type);
    }

    translate(position) {
        this.position = position;
        this.element.setAttributeNS(null, "position", "{} {} {}".format(this.position.x, this.position.y, this.position.z));
    }

    rotate(rotation) {
        this.rotation = rotation;
        this.element.setAttributeNS(null, "rotation", "{} {} {}".format(this.rotation.x, this.rotation.y, this.rotation.z));
    }
}