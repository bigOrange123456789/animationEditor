//位移产生的原因，像跑步之类的动画，整体有位移
function AnimationProcessor(animation,mesh){
    this.animation=animation;
    this.boneInverses;
    this.stepPosition=1;//
    this.stepRotation=1;
    this.boneIndex=7;
    this.frameIndex=0;
    this.boneOne=new THREE.Object3D();//{position:{},scale:{},rotation:{}};//与ui显示的情况对应

    //this.axis=new THREE.Object3D();

    this.init(mesh);
}
AnimationProcessor.prototype={
    quaternion2euler:function (quaternion) {
        var euler=new THREE.Euler(0,0,0, 'XYZ');
        euler.setFromQuaternion(quaternion);
        return euler;
    },
    euler2quaternion:function (euler) {
        var quaternion=new THREE.Quaternion();
        quaternion.setFromEuler(euler);
        return quaternion;
    },
    init:function (mesh) {


        this.boneInverses=mesh.skeleton.boneInverses;


        /*let axisX = new THREE.Mesh(new THREE.BoxBufferGeometry(50, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0000,depthTest: false}));
        //axisX.translateX(10.25);
        let axisY = new THREE.Mesh(new THREE.BoxBufferGeometry(0.1, 500, 0.1), new THREE.MeshBasicMaterial({ color: 0x00ff00,depthTest: false }));
        //axisY.translateY(100.25);
        let axisZ = new THREE.Mesh(new THREE.BoxBufferGeometry(0.1, 0.1, 500), new THREE.MeshBasicMaterial({ color: 0x0000ff,depthTest: false }));
        //axisZ.translateZ(1000.25);

        this.axis.add(axisX);
        this.axis.add(axisY);
        this.axis.add(axisZ);*/

        var This=this;
        //console.log(This.boneInverses[This.boneIndex].toArray());
        loop();
        function loop() {//animation->one //当前数据显示为骨骼的数据
            var i=This.boneIndex;
            var time=This.frameIndex;//修改地0帧的数据
            var animation=This.animation;

            This.boneOne.position.x=animation.tracks[3*i].values[3*time];
            This.boneOne.position.y=animation.tracks[3*i].values[3*time+1];
            This.boneOne.position.z=animation.tracks[3*i].values[3*time+2];

            var quaternion=new THREE.Quaternion();
            quaternion.set(
                animation.tracks[3*i+1].values[4*time],
                animation.tracks[3*i+1].values[4*time+1],
                animation.tracks[3*i+1].values[4*time+2],
                animation.tracks[3*i+1].values[4*time+3],
            );
            var euler=This.quaternion2euler(quaternion);
            This.boneOne.rotation.x=euler.x;
            This.boneOne.rotation.y=euler.y;
            This.boneOne.rotation.z=euler.z;

            //This.boneOne.updateMatrix();//更新对象的矩阵
            /*This.boneOne.matrix.multiplyMatrices(
                This.boneInverses[This.boneIndex]
                ,This.boneOne.matrix
            );*/
            //This.boneOne.matrixWorldNeedsUpdate=true;//使用矩阵更新对象
            //This.boneOne.

            /*This.axis.rotation.set(
                This.boneOne.rotation.x,
                This.boneOne.rotation.z,
                This.boneOne.rotation.z
            );
            This.axis.position.set(
                This.boneOne.position.x,
                This.boneOne.position.y,
                This.boneOne.position.z-10,
            );*/

            //alert(This.boneOne.matrix.toArray());
            //console.log(This.boneOne.matrix.toArray());

            //This.axis.matrixWorld=This.axis.matrix=This.boneOne.matrix;
            //This.axis.matrixWorldNeedsUpdate=true;//使用矩阵更新对象
            //This.axis.updateMatrix();
            //console.log(This.axis);

            requestAnimationFrame(loop);
        }
    },

    update:function () {//one->animation
        var This=this;
        var time=this.frameIndex;
        var i=This.boneIndex;
        This.animation.tracks[3*i].values[3*time]=this.boneOne.position.x;
        This.animation.tracks[3*i].values[3*time+1]=this.boneOne.position.y;
        This.animation.tracks[3*i].values[3*time+2]=this.boneOne.position.z;
        quaternion=This.euler2quaternion(new THREE.Euler(
            this.boneOne.rotation.x,
            this.boneOne.rotation.y,
            this.boneOne.rotation.z,
            'XYZ'));
        This.animation.tracks[3*i+1].values[4*time]=quaternion.x;
        This.animation.tracks[3*i+1].values[4*time+1]=quaternion.y;
        This.animation.tracks[3*i+1].values[4*time+2]=quaternion.z;
        This.animation.tracks[3*i+1].values[4*time+3]=quaternion.w;
    },
    frameCopy:function (i_start,i_end) {
        animation=this.animation;
        var time0=i_start,time1=i_end;
        for(var i=0;i<25;i++){//25个骨头
            var position=animation.tracks[3*i].values;
            var quaternion=animation.tracks[3*i+1].values;
            position[3*time1  ]=position[3*time0  ];
            position[3*time1+1]=position[3*time0+1];
            position[3*time1+2]=position[3*time0+2];

            quaternion[4*time1  ]=quaternion[4*time0  ];
            quaternion[4*time1+1]=quaternion[4*time0+1];
            quaternion[4*time1+2]=quaternion[4*time0+2];
            quaternion[4*time1+3]=quaternion[4*time0+3];
        }
    },

    //控制部分
    //frameIndex
    setFrameIndex:function (n) {
        this.frameIndex=n;
    },
    //boneIndex
    nextBoneIndex:function () {
        this.boneIndex++;
        if(this.boneIndex>=25)this.boneIndex=0;
    },
    preBoneIndex:function () {
        this.boneIndex--;
        if(this.boneIndex<=-1)this.boneIndex=24;
    },
    //boneOne
    modifyBoneOne:function (x_y_z ,add_sub) {//x,y,z 1,2,3 //+,- 1,-1
        //console.log(this.boneOne);
        //this.boneOne.matrixWorldNeedsUpdate=true;//使用矩阵更新对象
        //this.boneOne.updateMatrix();

        //if(x_y_z===1)this.boneOne.rotationX (add_sub*this.stepRotation);
        //else if(x_y_z===2)this.boneOne.rotationY (add_sub*this.stepRotation);
        //else this.boneOne.rotationZ (add_sub*this.stepRotation);

        if(x_y_z===1)
            this.boneOne.rotateOnAxis(
            new THREE.Vector3(1,0,0),
            add_sub*this.stepRotation
            );
        else if(x_y_z===2)
            this.boneOne.rotateOnAxis(
            new THREE.Vector3(0,1,0),
            add_sub*this.stepRotation
            );
        else
            this.boneOne.rotateOnAxis(
            new THREE.Vector3(0,0,1),
            add_sub*this.stepRotation
            );

        //this.boneOne.matrixWorldNeedsUpdate=true;//使用矩阵更新对象

        /*if(add_sub===1){
            if(x_y_z===1)this.boneOne.rotation.x+=this.stepRotation;
            else if(x_y_z===2)this.boneOne.rotation.y+=this.stepRotation;
            else this.boneOne.rotation.z+=this.stepRotation;
        }else{
            if(x_y_z===1)this.boneOne.rotation.x-=this.stepRotation;
            else if(x_y_z===2)this.boneOne.rotation.y-=this.stepRotation;
            else this.boneOne.rotation.z-=this.stepRotation;
        }*/
        this.update();
    },
}
/*仿射变换的操纵顺序：缩放->旋转->平移
* 缩放变换不改变坐标轴的走向，也不改变原点的位置，所以两个坐标系仍然重合。
旋转变换改变坐标轴的走向，但不改变原点的位置，所以两个坐标系坐标轴不再处于相同走向。
平移变换不改变坐标轴走向，但改变原点位置，两个坐标系原点不再重合。

这样就可以解释问什么缩放不能在旋转之后，而缩放和旋转都不能在平移之后了。 于是没有问题的顺序只能是 缩放 -> 旋转 -> 平移 。
* */