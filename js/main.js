function Main(){
    this.scene;
    this.camera;

    this.tag;
    this.button_flag;
    this.referee;

    this.button1;
    this.controller;
}
Main.prototype={
    //环境设置
    setContext:function () {
        this.frameIndex=this.frameIndexPre=0;
        var nameContext="";
        console.log('set context:'+nameContext);

        var scope=this;
        this.referee=new Referee();
        this.tag=new Text("","#2C3E50",25);
        this.button_flag=true;
        this.button=new ButtonS("保存为gltf",40);
        this.button2=new ButtonS("保存为json",100);
        this.button3=new ButtonS("保存为json'",160);



        var camera, scene, renderer;
        var light;
        init();
        render();
        function init() {
            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 10000);
            camera.position.z = 20;

            this.camera=camera;

            scene = new THREE.Scene();

            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0xffffff);
            document.body.appendChild( renderer.domElement );

            if (renderer.capabilities.isWebGL2 === false && renderer.extensions.has('ANGLE_instanced_arrays') === false) {
                document.getElementById('notSupported').style.display = '';
                return;
            }
            light = new THREE.AmbientLight(0xffffff,1.0)
            scene.add(light);
            new OrbitControls(camera,renderer.domElement,new THREE.Vector3(0,5,-100));
        }
        function render(){
            scope.frameIndex++;
            renderer.render( scene, camera );
            requestAnimationFrame(render);
        }
        this.scene=scene;
        this.camera=camera;
    },
    //启动
    start:function (){
        this.setContext();
        var scope=this;
        var loader= new THREE.GLTFLoader();

        loader.load("test.gltf", (glb) => {
            decompression(glb)
            console.log(glb)
            glb.scene.traverse(node=>{
                if(node instanceof THREE.SkinnedMesh){
                    console.log(node)
                    //node.scale.set(20,1,1)
                    scope.handle(node,glb.animations);
                    scope.handle3(node,glb.animations);
                    //scope.handle2(glb);
                }
            });
        });

        function decompression(glb) {
            var tracks=glb.animations[0].tracks;
            var time=tracks[0].times.length;
            var times=[]
            var value0=[];//position
            var value1=[];//quaternion
            var value2=[];//scale
            for(var i=0;i<time;i++){
                times.push(tracks[0].times[i]);
                value0.push(0);value0.push(0);value0.push(0);
                value1.push(0);value1.push(0);value1.push(0);value1.push(1);
                value2.push(1);value2.push(1);value2.push(1);
            }
            glb.scene.traverse(node=>{
                if(node instanceof THREE.SkinnedMesh){
                    var bones=node.skeleton.bones;
                    var tracks_new=[];
                    var kk=0;
                    while(kk<bones.length){

                        var t;
                        t=getTrackByName(tracks,bones[kk].name+".position");
                        if(!t){
                            t=new THREE.VectorKeyframeTrack(
                                bones[kk].name+".position",times,value0
                            );
                        }
                        tracks_new.push(t);

                        t=getTrackByName(tracks,bones[kk].name+".quaternion");
                        if(!t){
                            t=new THREE.QuaternionKeyframeTrack(
                                bones[kk].name+".position",times,value1
                            );
                        }
                        tracks_new.push(t);

                        t=getTrackByName(tracks,bones[kk].name+".scale");
                        if(!t){
                            t=new THREE.VectorKeyframeTrack(
                                bones[kk].name+".position",times,value2
                            );
                        }
                        tracks_new.push(t);

                        kk++;
                    }
                    glb.animations[0].tracks=tracks_new;
                }
            });
            function getTrackByName(arr,name){
                var result=null;
                for(var ii=0;ii<arr.length;ii++){
                    if(arr[ii].name===name)result=arr[ii]
                }
                return result;
            }

        }

        /*loader.load("test.gltf", (glb) => {
            decompression(glb)
        });*/
        //完成测试
    },
    //处理1（主要）
    handle: function (mesh, animations) {
        var scope = this;
        var controller = new SkinnedMeshController();
        controller.init(mesh, animations[0]);
        controller.mesh.rotation.set(Math.PI / 2, 0, 0);
        controller.mesh.scale.set(0.5, 0.5, 0.5);
        controller.mesh.position.set(0, -25, -100);
        this.scene.add(controller.mesh);
        this.controller=controller;

        var helper = new THREE.SkeletonHelper(controller.mesh);
        helper.material = new THREE.LineBasicMaterial({
            opacity: 1.0,
            linewidth: 10,
            vertexColors: THREE.VertexColors
        });//new THREE.MeshPhongMaterial({color:0x0000dd});//new THREE.BASI
        helper.rotation.set(Math.PI / 2, 0, 0);
        helper.scale.set(0.5, 0.5, 0.5);
        helper.position.set(0, -25, -100);
        //helper.material.linewidth = 10;
        scope.scene.add(helper);


        var material1 = controller.mesh.material;
        var material2 = helper.material;
        var material0 = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.5});
        helper.material = material0;

        var myAP = new AnimationProcessor(animations[0], mesh);
        myAP.boneIndex = 8;
        scope.tag.reStr("骨骼序号：" + myAP.boneIndex);
        scope.tag.rePos(50, 0);

        //this.scene.add(myAP.axis);

        var myUI = new UI();
        myUI.init();

        var button_material = myUI.button_material;
        button_material.addEvent(function () {
            if (button_material.element.innerHTML === "网格模式") {
                button_material.element.innerHTML = "骨骼模式";
                controller.mesh.material = material0;
                helper.material = material2;
            } else {
                button_material.element.innerHTML = "网格模式";
                controller.mesh.material = material1;
                helper.material = material0;
            }
        });

        var button_material2 = myUI.button_material2;
        myUI.button_material2.addEvent(function () {//动画共有36帧
            if (button_material2.element.innerHTML === "起始帧") {
                button_material2.element.innerHTML = "结束帧";
                myAP.setFrameIndex(35);
            } else {
                button_material2.element.innerHTML = "起始帧";
                myAP.setFrameIndex(0);
            }
        });

        var button1 = new ButtonP("上一个", "#1ABC9C", '#16A085', 15, 70, 90, 40);
        button1.rePos(220, -1);
        button1.addEvent(function () {
            myAP.preBoneIndex();
        });

        var button2 = new ButtonP("下一个", "#1ABC9C", '#16A085', 15, 70, 90, 40);
        button2.rePos(340, -1);
        button2.addEvent(function () {
            myAP.nextBoneIndex();
        });

        var tagPosition = 0;
        var tagHeight = 60;
        var tag1 = new Text("position_x", "#34495E", 15);
        tag1.rePos(50, 80 + 30 * tagPosition);
        tagPosition++;
        var button10 = new Button("+", "#1ABC9C", '#16A085', '#01DFA5', 29, 18, 34, 34);
        button10.rePos(50 + 140, tagHeight * tagPosition - 5);
        button10.addEvent(function () {
            myAP.boneOne.position.x += myAP.stepPosition;
            myAP.update();
        });
        var button11 = new Button("-", "#1ABC9C", '#16A085', '#01DFA5', 29, 18, 34, 34);
        button11.rePos(50 + 200, tagHeight * tagPosition - 5);
        button11.addEvent(function () {
            myAP.boneOne.position.x -= myAP.stepPosition;
            myAP.update();
        });


        var tag2 = new Text("position_y", "#34495E", 15);
        tag2.rePos(50, 80 + tagHeight * tagPosition);
        tagPosition++;
        var button20 = new Button("+", "#1ABC9C", '#16A085', '#01DFA5', 29, 18, 34, 34);
        button20.rePos(50 + 140, tagHeight * tagPosition - 5);
        button20.addEvent(function () {
            myAP.boneOne.position.y += myAP.stepPosition;
            myAP.update();
        });
        var button21 = new Button("-", "#1ABC9C", '#16A085', '#01DFA5', 29, 18, 34, 34);
        button21.rePos(50 + 200, tagHeight * tagPosition - 5);
        button21.addEvent(function () {
            myAP.boneOne.position.y -= myAP.stepPosition;
            myAP.update();
        });

        var tag3 = new Text("position_z", "#34495E", 15);
        tag3.rePos(50, 80 + tagHeight * tagPosition);
        tagPosition++;
        var button30 = new Button("+", "#1ABC9C", '#16A085', '#01DFA5', 29, 18, 34, 34);
        button30.rePos(50 + 140, tagHeight * tagPosition - 5);
        button30.addEvent(function () {
            myAP.boneOne.position.z += myAP.stepPosition;
            myAP.update();
        });
        var button31 = new Button("-", "#1ABC9C", '#16A085', '#01DFA5', 29, 18, 34, 34);
        button31.rePos(50 + 200, tagHeight * tagPosition - 5);
        button31.addEvent(function () {
            myAP.boneOne.position.z -= myAP.stepPosition;
            myAP.update();
        });/**/

        var tag4 = new Text("rotation_x", "#34495E", 15);
        tag4.rePos(50, 80 + tagHeight * tagPosition);
        tagPosition++;
        var button40 = new Button("+", "#1ABC9C", '#16A085', '#01DFA5', 29, 18, 34, 34);
        button40.rePos(50 + 140, tagHeight * tagPosition - 5);
        button40.addEvent(function () {
            myAP.modifyBoneOne(1, 1);
        });
        var button41 = new Button("-", "#1ABC9C", '#16A085', '#01DFA5', 29, 18, 34, 34);
        button41.rePos(50 + 200, tagHeight * tagPosition - 5);
        button41.addEvent(function () {
            myAP.modifyBoneOne(1, -1);
        });

        var tag5 = new Text("rotation_y", "#34495E", 15);
        tag5.rePos(50, 80 + tagHeight * tagPosition);
        tagPosition++;
        var button50 = new Button("+", "#1ABC9C", '#16A085', '#01DFA5', 29, 18, 34, 34);
        button50.rePos(50 + 140, tagHeight * tagPosition - 5);
        button50.addEvent(function () {
            myAP.modifyBoneOne(2, 1);
        });
        var button51 = new Button("-", "#1ABC9C", '#16A085', '#01DFA5', 29, 18, 34, 34);
        button51.rePos(50 + 200, tagHeight * tagPosition - 5);
        button51.addEvent(function () {
            myAP.modifyBoneOne(2, -1);
        });

        var tag6 = new Text("rotation_z", "#34495E", 15);
        tag6.rePos(50, 80 + tagHeight * tagPosition);
        tagPosition++;
        var button60 = new Button("+", "#1ABC9C", '#16A085', '#01DFA5', 29, 18, 34, 34);
        button60.rePos(50 + 140, tagHeight * tagPosition - 5);
        button60.addEvent(function () {
            myAP.modifyBoneOne(3, 1);
        });
        var button61 = new Button("-", "#1ABC9C", '#16A085', '#01DFA5', 29, 18, 34, 34);
        button61.rePos(50 + 200, tagHeight * tagPosition - 5);
        button61.addEvent(function () {
            myAP.modifyBoneOne(3, -1);
        });

        //var button3=new Button("positon step","red",10,150,40);
        var button3 = new Button("positon step", "#3498DB", '#2980B9', '#01DFD7', 12, 6, 150, 40);
        button3.rePos(60, 470);
        button3.addEvent(function () {
            myAP.stepPosition = parseFloat(
                prompt("pos步长 " + myAP.stepPosition + " 更新为:")
            );
        });/**/
        var button4 = new Button("rotation step", "#3498DB", '#2980B9', '#01DFD7', 12, 6, 150, 40);
        button4.rePos(60, 520);
        button4.addEvent(function () {
            myAP.stepRotation = parseFloat(
                prompt("rot步长 " + myAP.stepRotation + " 更新为:")
            );
        });

        var button5 = new Button("将起始帧复制到结束帧", "#3498DB", '#2980B9', '#01DFD7', 10, 150, 200, 40);
        button5.rePos(10, 600);//将起始帧的动作赋给结束帧
        button5.addEvent(function () {
            myAP.frameCopy(0, 35);
        });
        var button6 = new Button("将结束帧复制到起始帧", "#3498DB", '#2980B9', '#01DFD7', 10, 150, 200, 40);
        button6.rePos(10, 650);//将起始帧的动作赋给结束帧
        button6.addEvent(function () {
            myAP.frameCopy(35, 0);
        });

        scope.button.addEvent(function () {//下载按钮的设置
            controller.download(animations[0]);
        });
        scope.button2.addEvent(function () {//下载按钮的设置
            controller.download2(animations[0]);
        });
        scope.button3.addEvent(function () {//下载按钮的设置
            controller.download3(animations[0]);
        });

        updateAnimation();//
        function updateAnimation() {//one->ui
            controller.setTime(myAP.frameIndex);
            scope.tag.reStr("骨骼序号：" + myAP.boneIndex);
            //scope.tag.rePos(50,0);


            tag1.reStr("position_x:   " + (Math.floor(myAP.boneOne.position.x * 1000) / 1000));
            tag2.reStr("position_y:   " + (Math.floor(myAP.boneOne.position.y * 1000) / 1000));
            tag3.reStr("position_z:   " + (Math.floor(myAP.boneOne.position.z * 1000) / 1000));
            /**/

            tag4.reStr("rotation_x:   " + (Math.floor(myAP.boneOne.rotation.x * 1000) / 1000));
            tag5.reStr("rotation_y:   " + (Math.floor(myAP.boneOne.rotation.y * 1000) / 1000));
            tag6.reStr("rotation_z:   " + (Math.floor(myAP.boneOne.rotation.z * 1000) / 1000));

            button3.reStr("pos步长:" + myAP.stepPosition);
            button4.reStr("rot步长:" + myAP.stepRotation);

            requestAnimationFrame(updateAnimation);
        }
    },
    //处理1//用于观察经过PM和实例化处理后动画的效果
    handle2:function (glb) {
        var scope=this;
        //开始
        var pmLoader2 = new MyPMLoader(
            {animations: []},
            './model/Female',    //模型路径
            [],//没有LOD分级//LOD等级的数组
            scope.camera,  //LOD需要判断到相机的距离
            0,       //有多个动画时,表示第0个动画//可以通过pmLoader.updateAnimation(i)来切换动画
            0,     //动画播放速度//可以通过调整pmLoader.animationSpeed来调整速度
            [],
            function () {
                var mesh2 = pmLoader2.rootObject.children[0];
                var peoples2 = new InstancedGroup(
                    1,//908
                    [mesh2],//这些mesh的网格应该一致
                    true
                );
                //peoples2.neckPosition=0.68;
                //peoples2.vertURL="shader/vertexBone2.vert";
                //peoples2.fragURL="shader/fragment2.frag";
                peoples2.init(['./texture/w/w0.jpg', './texture/w/w0.jpg'], 16);

                peoples2.rotationSet(0, [Math.PI / 2, 0, 0]);
                peoples2.positionSet(0, [50,-25,-100]);
                peoples2.scaleSet(0, [0.5, 0.5, 0.5]);//最后一个是高

                peoples2.animationSet(0, 4);
                peoples2.speedSet(0, 1);

                scope.scene.add(peoples2.obj);

                setInterval(function () {
                    scope.controller.computeShaderData(glb,peoples2);
                },1000)


                var timeId2 = setInterval(function () {
                    mesh2 = pmLoader2.rootObject.children[0];
                    peoples2.setGeometry(mesh2.geometry);
                    console.log(pmLoader2.finished);
                    if (pmLoader2.finished) window.clearInterval(timeId2)
                }, 100);
            },
            1
        );
        //男性模型结束


    },
    //处理3
    handle3:function (mesh,animations) {
        var controller=new SkinnedMeshController();
        controller.init(mesh,animations[0]);
        controller.mesh.rotation.set(Math.PI / 2, 0, 0);
        //controller.mesh.scale.set(50,50,50);
        controller.mesh.scale.set(0.5,0.5,0.5);
        controller.mesh.position.set(50,-25,-100);
        controller.autoPlay2();

        this.scene.add(controller.mesh);
    },


}
var myMain=new Main();
myMain.start();
