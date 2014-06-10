function SpectrumAnalyzerView3d(model, selector) {
    this.model = model;
    this.selector = selector;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.elementWidth = (document.getElementsByTagName("div")["spectrum_analyzer"].offsetWidth - 2);
    this.renderer = undefined;
    this.camera = undefined;
    this.controls = undefined
    this.scene = undefined;
    this.barGeometry = undefined;
    this.clock = new THREE.Clock();
    this.uniformsBar = undefined;
    this.uniformsBackground = undefined;
    this.bars = [];
    this.initialize();
    this.createBars();
    this.createBackground();
}

SpectrumAnalyzerView3d.prototype.initialize = function() {
    // create the scene
    this.scene = new THREE.Scene();

    // create the renderer
    this.renderer = new THREE.WebGLRenderer(
        /*{
        antialias: true
    }*/
    );
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapSoft = true;
    document.getElementById(this.selector).appendChild(this.renderer.domElement);

    var data = this.model.getInitialData();

    // create and add the camera
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 1000);
    // the camera starts at 0,0,0 so pull it back
    this.camera.position.z = 300;
    this.camera.position.y = 300;
    this.scene.add(this.camera);

    // add in the orbit controls
    //this.controls = new THREE.OrbitControls(this.camera);
    //this.controls.addEventListener('change', this.render);

    this.barGeometry = new THREE.CubeGeometry(15, 150, 15, 1, 1, 1);
    this.barGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 75, 0));
    //this.barGeometry.faces.splice(3, 1);
    //this.barGeometry.faceVertexUvs[0].splice(3, 1);

    var light = new THREE.DirectionalLight();
    light.intensity = 0.9;
    light.castShadow = true;
    light.position.set(10, 350, 100);
    this.scene.add(light);

    // add to the scene
    this.scene.add(light);
}

SpectrumAnalyzerView3d.prototype.createBars = function() {

    var barZPos = 0,
        x = 0,
        y = 0,
        z = 0;

    this.uniformsBar = {
        time: {
            type: "f",
            value: 0.0
        },
        resolution: {
            type: "v2",
            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        }
    };

    for (var j = 0; j < 10; j++) {

        var barXPos = -85;

        for (var i = 0; i < 10; i++) {

            var barMaterial = new THREE.ShaderMaterial({
                uniforms: this.uniformsBar,
                vertexShader: document.getElementById('vertexShader').textContent,
                fragmentShader: document.getElementById('fragmentShaderBar').textContent
            });

            var mesh = new THREE.Mesh(this.barGeometry, barMaterial);
            mesh.position.set(barXPos, 0, barZPos);
            mesh.castShadow = true;
            mesh.receiveShadow = false;
            this.scene.add(mesh);
            this.bars.push(mesh);
            barXPos += 25;
        }

        barZPos -= 25;
    }
}

SpectrumAnalyzerView3d.prototype.createBackground = function() {
    this.uniformsBackground = {
        time: {
            type: "f",
            value: 0.0
        },
        resolution: {
            type: "v2",
            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        }
    };

    var skyGeometry = new THREE.CubeGeometry(600, 600, 600, 1, 1, 1, null, true);

    var backgroundMaterial = new THREE.ShaderMaterial({
        uniforms: this.uniformsBackground,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShaderBackground').textContent,
        side: THREE.DoubleSide
    });

    var meshSkybox = new THREE.Mesh(skyGeometry, backgroundMaterial);

    this.scene.add(meshSkybox);
}

SpectrumAnalyzerView3d.prototype.animate = function() {
    view = Application.getView();
    var data = view.model.data;

    if (data.length > 0) {
        var max = Math.max.apply(Math, data);

        for (var i = 0; i < view.bars.length; i++) {
            TweenLite.to(view.bars[i].scale, 0.1, {
                y: data[i] / max,
                ease: Circ.easeIn
            });
        }
    }
    requestAnimationFrame(view.animate);
    view.render();
}

// draw!
SpectrumAnalyzerView3d.prototype.render = function() {
    view = Application.getView();

    var delta = view.clock.getDelta();

    var timer = -0.0002 * Date.now();

    view.camera.position.x = 300 * Math.cos(timer);
    view.camera.position.z = 300 * Math.sin(timer);

    view.camera.lookAt(view.scene.position);

    view.uniformsBar.time.value = view.clock.elapsedTime;
    view.uniformsBackground.time.value = view.clock.elapsedTime;
    view.renderer.render(view.scene, view.camera);
}
