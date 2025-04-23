import * as THREE from 'three';

// Class untuk mengelola model 3D
export class ModelsManager {
  constructor() {
    // Model caches
    this.models = {};
  }
  
  // Membuat model fakultas lengkap
  createFacultyModel() {
    const facultyGroup = new THREE.Group();
    facultyGroup.name = "faculty";
    
    // Ground/Campus
    const groundGeometry = new THREE.CircleGeometry(50, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a9d23,
      metalness: 0.1,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    facultyGroup.add(ground);
    
    // Create main building
    const mainBuilding = this.createMainBuilding();
    mainBuilding.position.set(0, 0, 0);
    facultyGroup.add(mainBuilding);
    
    // Create secondary buildings
    const secondaryBuilding1 = this.createSecondaryBuilding();
    secondaryBuilding1.position.set(-15, 0, 5);
    secondaryBuilding1.rotation.y = Math.PI / 4;
    facultyGroup.add(secondaryBuilding1);
    
    const secondaryBuilding2 = this.createSecondaryBuilding();
    secondaryBuilding2.position.set(15, 0, 5);
    secondaryBuilding2.rotation.y = -Math.PI / 4;
    facultyGroup.add(secondaryBuilding2);
    
    // Create paths
    this.createCampusPaths(facultyGroup);
    
    // Add trees and decorations
    this.addTreesAndDecorations(facultyGroup);
    
    // Add campus entrance
    this.createCampusEntrance(facultyGroup);
    
    // Store in cache
    this.models.faculty = facultyGroup;
    
    return facultyGroup;
  }
  
  // Membuat model gedung utama
  createMainBuilding() {
    const buildingGroup = new THREE.Group();
    buildingGroup.name = "mainBuilding";
    
    // Base/Foundation
    const baseGeometry = new THREE.BoxGeometry(20, 1, 12);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.3,
      roughness: 0.8
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.5;
    base.receiveShadow = true;
    base.castShadow = true;
    buildingGroup.add(base);
    
    // Steps
    const stepsGroup = new THREE.Group();
    const stepsWidth = 10;
    
    for (let i = 0; i < 3; i++) {
      const stepGeometry = new THREE.BoxGeometry(stepsWidth, 0.2, 1);
      const stepMaterial = new THREE.MeshStandardMaterial({
        color: 0x999999,
        metalness: 0.1,
        roughness: 0.7
      });
      const step = new THREE.Mesh(stepGeometry, stepMaterial);
      step.position.set(0, i * 0.2, 6.5 + i * 0.5);
      step.receiveShadow = true;
      step.castShadow = true;
      stepsGroup.add(step);
    }
    
    buildingGroup.add(stepsGroup);
    
    // Main structure
    const mainGeometry = new THREE.BoxGeometry(18, 8, 10);
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      metalness: 0.1,
      roughness: 0.7
    });
    const mainStructure = new THREE.Mesh(mainGeometry, mainMaterial);
    mainStructure.position.y = 3.5;
    mainStructure.castShadow = true;
    mainStructure.receiveShadow = true;
    mainStructure.name = "building";
    buildingGroup.add(mainStructure);
    
    // Create windows
    this.createWindows(buildingGroup);
    
    // Create main entrance
    this.createMainEntrance(buildingGroup);
    
    // Create roof
    this.createRoof(buildingGroup);
    
    // Add text - Faculty name
    this.createFacultyText(buildingGroup);
    
    // Add decorative elements
    this.addDecorativeElements(buildingGroup);
    
    return buildingGroup;
  }
  
  // Membuat jendela untuk gedung
  createWindows(buildingGroup) {
    const windowGeometry = new THREE.PlaneGeometry(1.5, 2);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      metalness: 0.5,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    // Front windows
    for (let i = -3; i <= 3; i += 2) {
      if (i !== -1 && i !== 1) { // Skip middle where the door is
        const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        frontWindow.position.set(i * 2, 3.5, 5.01);
        frontWindow.castShadow = false;
        frontWindow.receiveShadow = false;
        frontWindow.name = "window";
        buildingGroup.add(frontWindow);
        
        // Second floor
        const frontWindowTop = new THREE.Mesh(windowGeometry, windowMaterial);
        frontWindowTop.position.set(i * 2, 6, 5.01);
        frontWindowTop.castShadow = false;
        frontWindowTop.receiveShadow = false;
        frontWindowTop.name = "window";
        buildingGroup.add(frontWindowTop);
      }
    }
    
    // Back windows
    for (let i = -3; i <= 3; i += 2) {
      const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
      backWindow.position.set(i * 2, 3.5, -5.01);
      backWindow.castShadow = false;
      backWindow.receiveShadow = false;
      backWindow.name = "window";
      buildingGroup.add(backWindow);
      
      // Second floor
      const backWindowTop = new THREE.Mesh(windowGeometry, windowMaterial);
      backWindowTop.position.set(i * 2, 6, -5.01);
      backWindowTop.castShadow = false;
      backWindowTop.receiveShadow = false;
      backWindowTop.name = "window";
      buildingGroup.add(backWindowTop);
    }
    
    // Side windows
    for (let i = -1; i <= 1; i += 2) {
      // Left side
      const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
      leftWindow.position.set(-9.01, 3.5, i * 2);
      leftWindow.rotation.y = Math.PI / 2;
      leftWindow.castShadow = false;
      leftWindow.receiveShadow = false;
      leftWindow.name = "window";
      buildingGroup.add(leftWindow);
      
      const leftWindowTop = new THREE.Mesh(windowGeometry, windowMaterial);
      leftWindowTop.position.set(-9.01, 6, i * 2);
      leftWindowTop.rotation.y = Math.PI / 2;
      leftWindowTop.castShadow = false;
      leftWindowTop.receiveShadow = false;
      leftWindowTop.name = "window";
      buildingGroup.add(leftWindowTop);
      
      // Right side
      const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
      rightWindow.position.set(9.01, 3.5, i * 2);
      rightWindow.rotation.y = Math.PI / 2;
      rightWindow.castShadow = false;
      rightWindow.receiveShadow = false;
      rightWindow.name = "window";
      buildingGroup.add(rightWindow);
      
      const rightWindowTop = new THREE.Mesh(windowGeometry, windowMaterial);
      rightWindowTop.position.set(9.01, 6, i * 2);
      rightWindowTop.rotation.y = Math.PI / 2;
      rightWindowTop.castShadow = false;
      rightWindowTop.receiveShadow = false;
      rightWindowTop.name = "window";
      buildingGroup.add(rightWindowTop);
    }
  }
  
  // Membuat pintu masuk utama
  createMainEntrance(buildingGroup) {
    // Door frame
    const doorFrameGeometry = new THREE.BoxGeometry(4, 4, 0.5);
    const doorFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.3,
      roughness: 0.7
    });
    const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
    doorFrame.position.set(0, 2, 5.2);
    doorFrame.castShadow = true;
    doorFrame.receiveShadow = true;
    buildingGroup.add(doorFrame);
    
    // Doors (glass)
    const doorGeometry = new THREE.BoxGeometry(1.8, 3.6, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      metalness: 0.5,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    
    const leftDoor = new THREE.Mesh(doorGeometry, doorMaterial);
    leftDoor.position.set(-0.95, 1.8, 5.4);
    leftDoor.castShadow = false;
    leftDoor.receiveShadow = true;
    leftDoor.name = "leftDoor";
    buildingGroup.add(leftDoor);
    
    const rightDoor = new THREE.Mesh(doorGeometry, doorMaterial);
    rightDoor.position.set(0.95, 1.8, 5.4);
    rightDoor.castShadow = false;
    rightDoor.receiveShadow = true;
    rightDoor.name = "rightDoor";
    buildingGroup.add(rightDoor);
    
    // Door handles
    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    leftHandle.rotation.z = Math.PI / 2;
    leftHandle.position.set(-0.3, 1.8, 5.5);
    buildingGroup.add(leftHandle);
    
    const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    rightHandle.rotation.z = Math.PI / 2;
    rightHandle.position.set(0.3, 1.8, 5.5);
    buildingGroup.add(rightHandle);
  }
  
  // Membuat atap gedung
  createRoof(buildingGroup) {
    // Main roof
    const roofGeometry = new THREE.ConeGeometry(14, 6, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x005691, // ITK blue
      metalness: 0.3,
      roughness: 0.7
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 11, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    roof.receiveShadow = true;
    buildingGroup.add(roof);
    
    // Roof detail - central dome
    const domeGeometry = new THREE.SphereGeometry(3, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.5,
      roughness: 0.5
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.set(0, 11, 0);
    dome.castShadow = true;
    dome.receiveShadow = true;
    buildingGroup.add(dome);
    
    // Dome pinnacle
    const pinnacleGeometry = new THREE.ConeGeometry(0.5, 2, 16);
    const pinnacleMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      metalness: 0.8,
      roughness: 0.2
    });
    const pinnacle = new THREE.Mesh(pinnacleGeometry, pinnacleMaterial);
    pinnacle.position.set(0, 13.5, 0);
    pinnacle.castShadow = true;
    buildingGroup.add(pinnacle);
  }
  
  // Membuat teks fakultas
  createFacultyText(buildingGroup) {
    // Create a simple representation of text using geometry
    const textPanelGeometry = new THREE.BoxGeometry(12, 1, 0.2);
    const textPanelMaterial = new THREE.MeshStandardMaterial({
      color: 0x005691, // ITK blue
      metalness: 0.3,
      roughness: 0.7
    });
    const textPanel = new THREE.Mesh(textPanelGeometry, textPanelMaterial);
    textPanel.position.set(0, 7.5, 5.1);
    textPanel.castShadow = true;
    textPanel.receiveShadow = false;
    textPanel.name = "facultySign";
    buildingGroup.add(textPanel);
  }
  
  // Menambahkan elemen dekoratif
  addDecorativeElements(buildingGroup) {
    // Pillars at entrance
    const pillarGeometry = new THREE.CylinderGeometry(0.4, 0.4, 8, 16);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      metalness: 0.1,
      roughness: 0.8
    });
    
    const pillar1 = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar1.position.set(-5, 3.5, 5);
    pillar1.castShadow = true;
    pillar1.receiveShadow = true;
    buildingGroup.add(pillar1);
    
    const pillar2 = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar2.position.set(5, 3.5, 5);
    pillar2.castShadow = true;
    pillar2.receiveShadow = true;
    buildingGroup.add(pillar2);
    
    // Pillar caps
    const capGeometry = new THREE.BoxGeometry(1.2, 0.5, 1.2);
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.2,
      roughness: 0.6
    });
    
    const cap1 = new THREE.Mesh(capGeometry, capMaterial);
    cap1.position.set(-5, 7.5, 5);
    cap1.castShadow = true;
    cap1.receiveShadow = true;
    buildingGroup.add(cap1);
    
    const cap2 = new THREE.Mesh(capGeometry, capMaterial);
    cap2.position.set(5, 7.5, 5);
    cap2.castShadow = true;
    cap2.receiveShadow = true;
    buildingGroup.add(cap2);
    
    // Base caps
    const baseCap1 = new THREE.Mesh(capGeometry, capMaterial);
    baseCap1.position.set(-5, -0.2, 5);
    baseCap1.castShadow = true;
    baseCap1.receiveShadow = true;
    buildingGroup.add(baseCap1);
    
    const baseCap2 = new THREE.Mesh(capGeometry, capMaterial);
    baseCap2.position.set(5, -0.2, 5);
    baseCap2.castShadow = true;
    baseCap2.receiveShadow = true;
    buildingGroup.add(baseCap2);
    
    // Flagpole
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 10, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.5,
      roughness: 0.5
    });
    const flagpole = new THREE.Mesh(poleGeometry, poleMaterial);
    flagpole.position.set(9, 4.5, 4);
    flagpole.castShadow = true;
    buildingGroup.add(flagpole);
    
    // Flag
    const flagGeometry = new THREE.PlaneGeometry(2, 1);
    const flagMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000, // Red
      side: THREE.DoubleSide
    });
    const flag = new THREE.Mesh(flagGeometry, flagMaterial);
    flag.position.set(8, 8, 4);
    flag.castShadow = true;
    buildingGroup.add(flag);
  }
  
  // Membuat gedung sekunder
  createSecondaryBuilding() {
    const building = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.BoxGeometry(12, 0.5, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.3,
      roughness: 0.8
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.25;
    base.receiveShadow = true;
    building.add(base);
    
    // Main structure
    const mainGeometry = new THREE.BoxGeometry(10, 5, 6);
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      metalness: 0.1,
      roughness: 0.7
    });
    const main = new THREE.Mesh(mainGeometry, mainMaterial);
    main.position.y = 2.5;
    main.castShadow = true;
    main.receiveShadow = true;
    building.add(main);
    
    // Roof
    const roofGeometry = new THREE.BoxGeometry(11, 0.5, 7);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.3,
      roughness: 0.8
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 5.25;
    roof.castShadow = true;
    roof.receiveShadow = true;
    building.add(roof);
    
    // Windows
    const windowGeometry = new THREE.PlaneGeometry(1.2, 1.5);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      metalness: 0.5,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    // Front windows
    for (let i = -1; i <= 1; i += 1) {
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(i * 3, 2.5, 3.01);
      window.castShadow = false;
      window.receiveShadow = false;
      building.add(window);
    }
    
    // Back windows
    for (let i = -1; i <= 1; i += 1) {
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(i * 3, 2.5, -3.01);
      window.castShadow = false;
      window.receiveShadow = false;
      building.add(window);
    }
    
    // Side windows
    for (let i = -1; i <= 1; i += 2) {
      // Left side
      const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
      leftWindow.position.set(-5.01, 2.5, i);
      leftWindow.rotation.y = Math.PI / 2;
      leftWindow.castShadow = false;
      leftWindow.receiveShadow = false;
      building.add(leftWindow);
      
      // Right side
      const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
      rightWindow.position.set(5.01, 2.5, i);
      rightWindow.rotation.y = Math.PI / 2;
      rightWindow.castShadow = false;
      rightWindow.receiveShadow = false;
      building.add(rightWindow);
    }
    
    // Door
    const doorGeometry = new THREE.PlaneGeometry(1.5, 2.5);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x995522,
      metalness: 0.3,
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.25, 3.01);
    door.castShadow = false;
    door.receiveShadow = true;
    building.add(door);
    
    return building;
  }
  
  // Membuat jalan kampus
  createCampusPaths(facultyGroup) {
    // Main path
    const mainPathGeometry = new THREE.PlaneGeometry(5, 30);
    const pathMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 0.1,
      roughness: 1.0,
      side: THREE.DoubleSide
    });
    const mainPath = new THREE.Mesh(mainPathGeometry, pathMaterial);
    mainPath.rotation.x = -Math.PI / 2;
    mainPath.position.set(0, -0.48, 15);
    mainPath.receiveShadow = true;
    facultyGroup.add(mainPath);
    
    // Path to left building
    const leftPathGeometry = new THREE.PlaneGeometry(20, 3);
    const leftPath = new THREE.Mesh(leftPathGeometry, pathMaterial);
    leftPath.rotation.x = -Math.PI / 2;
    leftPath.position.set(-7.5, -0.48, 5);
    leftPath.receiveShadow = true;
    facultyGroup.add(leftPath);
    
    // Path to right building
    const rightPathGeometry = new THREE.PlaneGeometry(20, 3);
    const rightPath = new THREE.Mesh(rightPathGeometry, pathMaterial);
    rightPath.rotation.x = -Math.PI / 2;
    rightPath.position.set(7.5, -0.48, 5);
    rightPath.receiveShadow = true;
    facultyGroup.add(rightPath);
    
    // Circular path around main building
    const circlePathGeometry = new THREE.RingGeometry(12, 15, 32);
    const circlePath = new THREE.Mesh(circlePathGeometry, pathMaterial);
    circlePath.rotation.x = -Math.PI / 2;
    circlePath.position.y = -0.48;
    circlePath.receiveShadow = true;
    facultyGroup.add(circlePath);
  }
  
  // Menambahkan pohon dan dekorasi
  addTreesAndDecorations(facultyGroup) {
    // Trees
    const treePositions = [
      [-20, 0, -15],
      [-15, 0, -20],
      [-10, 0, -18],
      [10, 0, -18],
      [15, 0, -20],
      [20, 0, -15],
      [-20, 0, 15],
      [-25, 0, 5],
      [20, 0, 15],
      [25, 0, 5],
      [0, 0, -25],
      [0, 0, 30],
      [-5, 0, 20],
      [5, 0, 20]
    ];
    
    treePositions.forEach((pos, index) => {
      const tree = this.createTree(index % 3); // 3 different types of trees
      tree.position.set(...pos);
      facultyGroup.add(tree);
    });
    
    // Benches
    const benchPositions = [
      [-5, 0, 10, 0],
      [5, 0, 10, 0],
      [-10, 0, 0, Math.PI / 2],
      [10, 0, 0, Math.PI / 2]
    ];
    
    benchPositions.forEach(pos => {
      const bench = this.createBench();
      bench.position.set(pos[0], pos[1], pos[2]);
      bench.rotation.y = pos[3];
      facultyGroup.add(bench);
    });
    
    // Lamp posts
    const lampPositions = [
      [-10, 0, 15],
      [10, 0, 15],
      [-15, 0, 5],
      [15, 0, 5],
      [0, 0, 25],
      [-10, 0, -10],
      [10, 0, -10]
    ];
    
    lampPositions.forEach(pos => {
      const lamp = this.createLampPost();
      lamp.position.set(...pos);
      facultyGroup.add(lamp);
    });
  }
  
  // Membuat pohon
  createTree(type = 0) {
    const tree = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2 + Math.random(), 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      metalness: 0.1,
      roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);
    
    // Leaves
    let leavesGeometry;
    let leavesColor;
    
    switch (type) {
      case 0: // Pine tree
        leavesGeometry = new THREE.ConeGeometry(1.5, 4, 8);
        leavesColor = 0x2d572c;
        break;
      case 1: // Bushy tree
        leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
        leavesColor = 0x3a9d23;
        break;
      case 2: // Thin tree
        leavesGeometry = new THREE.ConeGeometry(1, 3, 16);
        leavesColor = 0x52b788;
        break;
      default:
        leavesGeometry = new THREE.ConeGeometry(1.5, 4, 8);
        leavesColor = 0x2E8B57;
    }
    
    const leavesMaterial = new THREE.MeshStandardMaterial({
      color: leavesColor,
      metalness: 0.05,
      roughness: 0.8
    });
    
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = type === 1 ? 3 : 3.5;
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    tree.add(leaves);
    
    // Add second layer for pine trees
    if (type === 0) {
      const leaves2 = new THREE.Mesh(
        new THREE.ConeGeometry(1, 3, 8),
        leavesMaterial
      );
      leaves2.position.y = 5;
      leaves2.castShadow = true;
      leaves2.receiveShadow = true;
      tree.add(leaves2);
    }
    
    return tree;
  }
  
  // Membuat bangku taman
  createBench() {
    const bench = new THREE.Group();
    
    // Bench seat
    const seatGeometry = new THREE.BoxGeometry(3, 0.1, 1);
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: 0x886622,
      metalness: 0.1,
      roughness: 0.8
    });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.6;
    seat.castShadow = true;
    seat.receiveShadow = true;
    bench.add(seat);
    
    // Bench back
    const backGeometry = new THREE.BoxGeometry(3, 1, 0.1);
    const back = new THREE.Mesh(backGeometry, seatMaterial);
    back.position.set(0, 1.1, -0.45);
    back.castShadow = true;
    back.receiveShadow = true;
    bench.add(back);
    
    // Bench legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.6, 1);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.5,
      roughness: 0.7
    });
    
    const leg1 = new THREE.Mesh(legGeometry, legMaterial);
    leg1.position.set(-1.2, 0.3, 0);
    leg1.castShadow = true;
    leg1.receiveShadow = true;
    bench.add(leg1);
    
    const leg2 = new THREE.Mesh(legGeometry, legMaterial);
    leg2.position.set(1.2, 0.3, 0);
    leg2.castShadow = true;
    leg2.receiveShadow = true;
    bench.add(leg2);
    
    return bench;
  }
  
  // Membuat lampu taman
  createLampPost() {
    const lamp = new THREE.Group();
    
    // Post
    const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
    const postMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.5,
      roughness: 0.7
    });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = 2.5;
    post.castShadow = true;
    post.receiveShadow = true;
    lamp.add(post);
    
    // Lamp head
    const headGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.7,
      roughness: 0.3
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 5;
    head.castShadow = true;
    head.receiveShadow = true;
    lamp.add(head);
    
    // Light bulb
    const bulbGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const bulbMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdd88,
      emissive: 0xffee88,
      emissiveIntensity: 0.5,
      metalness: 0.0,
      roughness: 0.0
    });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulb.position.y = 4.8;
    lamp.add(bulb);
    
    // Light
    const light = new THREE.PointLight(0xffdd88, 0.8, 15);
    light.position.y = 4.8;
    light.castShadow = true;
    lamp.add(light);
    
    return lamp;
  }
  
  // Membuat gerbang kampus
  createCampusEntrance(facultyGroup) {
    // Entrance gate
    const gateGroup = new THREE.Group();
    
    // Left pillar
    const pillarGeometry = new THREE.BoxGeometry(1, 6, 1);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.3,
      roughness: 0.8
    });
    const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    leftPillar.position.set(-4, 3, 30);
    leftPillar.castShadow = true;
    leftPillar.receiveShadow = true;
    gateGroup.add(leftPillar);
    
    // Right pillar
    const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    rightPillar.position.set(4, 3, 30);
    rightPillar.castShadow = true;
    rightPillar.receiveShadow = true;
    gateGroup.add(rightPillar);
    
    // Top arch
    const archGeometry = new THREE.CylinderGeometry(0.5, 0.5, 10, 16, 1, false, 0, Math.PI);
    const archMaterial = new THREE.MeshStandardMaterial({
      color: 0x005691, // ITK blue
      metalness: 0.3,
      roughness: 0.7
    });
    const arch = new THREE.Mesh(archGeometry, archMaterial);
    arch.position.set(0, 6, 30);
    arch.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    arch.castShadow = true;
    arch.receiveShadow = true;
    gateGroup.add(arch);
    
    // Gate name board
    const boardGeometry = new THREE.BoxGeometry(7, 1, 0.2);
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.5
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.set(0, 7, 30);
    board.castShadow = true;
    board.receiveShadow = true;
    gateGroup.add(board);
    
    facultyGroup.add(gateGroup);
  }
  
  // Metode bantuan untuk mendapatkan model yang telah dicache
  getModel(name) {
    return this.models[name] || null;
  }
  
  // Metode untuk membuat model khusus untuk virtual tour
  createTourModel(location) {
    // Implementasi model untuk lokasi-lokasi virtual tour khusus
    switch(location) {
      case 'main-building':
        return this.createDetailedMainBuilding();
      case 'ai-lab':
        return this.createAILabModel();
      case 'library':
        return this.createLibraryModel();
      case 'creative-space':
        return this.createCreativeSpaceModel();
      case 'hall':
        return this.createHallModel();
      default:
        return this.createFacultyModel(); // Default model
    }
  }
  
  // Model ruangan detail untuk virtual tour
  createDetailedMainBuilding() {
    const building = new THREE.Group();
    building.name = "detailed-main-building";
    
    // Tambahkan lantai
    const floorGeometry = new THREE.PlaneGeometry(20, 15);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.1,
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    building.add(floor);
    
    // Tambahkan dinding
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      metalness: 0.1,
      roughness: 0.8
    });
    
    // Dinding depan
    const frontWallGeometry = new THREE.BoxGeometry(20, 4, 0.2);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, 2, 7.5);
    frontWall.castShadow = true;
    frontWall.receiveShadow = true;
    building.add(frontWall);
    
    // Dinding belakang
    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.position.set(0, 2, -7.5);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    building.add(backWall);
    
    // Dinding kiri
    const sideWallGeometry = new THREE.BoxGeometry(0.2, 4, 15);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-10, 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    building.add(leftWall);
    
    // Dinding kanan
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(10, 2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    building.add(rightWall);
    
    // Langit-langit
    const ceilingGeometry = new THREE.PlaneGeometry(20, 15);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4;
    ceiling.receiveShadow = true;
    building.add(ceiling);
    
    // Tambahkan perabotan dan detail lainnya
    this.addFurniture(building);
    
    return building;
  }
  
  // Tambahkan perabotan
  addFurniture(buildingGroup) {
    // Meja resepsi
    const deskGeometry = new THREE.BoxGeometry(4, 1, 1.5);
    const deskMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513, // Warna kayu
      metalness: 0.2,
      roughness: 0.8
    });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.set(0, 0.5, 5);
    desk.castShadow = true;
    desk.receiveShadow = true;
    buildingGroup.add(desk);
    
    // Kursi
    const chairGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.8);
    const chairMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.3,
      roughness: 0.7
    });
    
    const chair1 = new THREE.Mesh(chairGeometry, chairMaterial);
    chair1.position.set(-5, 0.6, 3);
    chair1.castShadow = true;
    chair1.receiveShadow = true;
    buildingGroup.add(chair1);
    
    const chair2 = new THREE.Mesh(chairGeometry, chairMaterial);
    chair2.position.set(-3, 0.6, 3);
    chair2.castShadow = true;
    chair2.receiveShadow = true;
    buildingGroup.add(chair2);
    
    // Pot tanaman
    const potGeometry = new THREE.CylinderGeometry(0.5, 0.3, 1, 16);
    const potMaterial = new THREE.MeshStandardMaterial({
      color: 0xaa7744,
      metalness: 0.1,
      roughness: 0.8
    });
    
    const pot = new THREE.Mesh(potGeometry, potMaterial);
    pot.position.set(-8, 0.5, 6);
    pot.castShadow = true;
    pot.receiveShadow = true;
    buildingGroup.add(pot);
    
    // Tanaman pada pot
    const plantGeometry = new THREE.SphereGeometry(0.8, 8, 8);
    const plantMaterial = new THREE.MeshStandardMaterial({
      color: 0x2E8B57,
      metalness: 0.1,
      roughness: 0.9
    });
    
    const plant = new THREE.Mesh(plantGeometry, plantMaterial);
    plant.position.set(-8, 1.5, 6);
    plant.castShadow = true;
    plant.receiveShadow = true;
    buildingGroup.add(plant);
    
    // Papan informasi
    const boardGeometry = new THREE.BoxGeometry(3, 2, 0.1);
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0x005691, // Warna ITK
      metalness: 0.3,
      roughness: 0.7
    });
    
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.set(-8, 2, -7);
    board.castShadow = true;
    board.receiveShadow = true;
    buildingGroup.add(board);
    
    // Tambahkan lampu
    const lightGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffcc,
      emissiveIntensity: 0.5,
      metalness: 0.1,
      roughness: 0.5
    });
    
    for (let x = -7.5; x <= 7.5; x += 5) {
      for (let z = -5; z <= 5; z += 5) {
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(x, 3.95, z);
        buildingGroup.add(light);
        
        const pointLight = new THREE.PointLight(0xffffcc, 0.5, 10);
        pointLight.position.set(x, 3.8, z);
        buildingGroup.add(pointLight);
      }
    }
  }
  
  // Menciptakan model Laboratorium AI
  createAILabModel() {
    const lab = new THREE.Group();
    lab.name = "ai-lab";
    
    // Tambahkan dasar ruangan seperti di createDetailedMainBuilding
    const floorGeometry = new THREE.PlaneGeometry(15, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444, // Lantai gelap untuk lab
      metalness: 0.2,
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    lab.add(floor);
    
    // Tambahkan dinding
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      metalness: 0.1,
      roughness: 0.8
    });
    
    // Dinding depan, belakang, kiri, kanan
    const frontWallGeometry = new THREE.BoxGeometry(15, 4, 0.2);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, 2, 5);
    lab.add(frontWall);
    
    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.position.set(0, 2, -5);
    lab.add(backWall);
    
    const sideWallGeometry = new THREE.BoxGeometry(0.2, 4, 10);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-7.5, 2, 0);
    lab.add(leftWall);
    
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(7.5, 2, 0);
    lab.add(rightWall);
    
    // Langit-langit
    const ceilingGeometry = new THREE.PlaneGeometry(15, 10);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0xececec,
      metalness: 0.1,
      roughness: 0.9,
      side: THREE.DoubleSide
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4;
    lab.add(ceiling);
    
    // Tambahkan workstation komputer
    this.addComputerWorkstations(lab);
    
    // Tambahkan server rack
    this.addServerRack(lab);
    
    return lab;
  }
  
  // Menambahkan workstation komputer
  addComputerWorkstations(labGroup) {
    const deskGeometry = new THREE.BoxGeometry(2, 0.1, 1);
    const deskMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222, // Warna meja hitam
      metalness: 0.3,
      roughness: 0.7
    });
    
    const monitorBaseGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.3);
    const monitorStandGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);
    const monitorGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.05);
    const monitorScreenGeometry = new THREE.PlaneGeometry(0.75, 0.45);
    
    const monitorMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.5,
      roughness: 0.5
    });
    
    const monitorScreenMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x104060,
      emissiveIntensity: 0.8,
      metalness: 0.0,
      roughness: 0.0
    });
    
    const keyboardGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.2);
    const keyboardMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.3,
      roughness: 0.7
    });
    
    const mouseGeometry = new THREE.BoxGeometry(0.1, 0.03, 0.06);
    const mouseMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.3,
      roughness: 0.6
    });
    
    const chairGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.6);
    const chairLegGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8);
    const chairBackGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.1);
    const chairMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.3,
      roughness: 0.7
    });
    
    // Buat workstation di beberapa posisi
    const workstationPositions = [
      [-5, 0, 3],
      [-2.5, 0, 3],
      [0, 0, 3],
      [2.5, 0, 3],
      [5, 0, 3],
      [-5, 0, 0],
      [-2.5, 0, 0],
      [0, 0, 0],
      [2.5, 0, 0],
      [5, 0, 0]
    ];
    
    workstationPositions.forEach(pos => {
      // Meja
      const desk = new THREE.Mesh(deskGeometry, deskMaterial);
      desk.position.set(pos[0], pos[1] + 0.7, pos[2]);
      desk.castShadow = true;
      desk.receiveShadow = true;
      labGroup.add(desk);
      
      // Monitor base
      const monitorBase = new THREE.Mesh(monitorBaseGeometry, monitorMaterial);
      monitorBase.position.set(pos[0], pos[1] + 0.75, pos[2] - 0.3);
      labGroup.add(monitorBase);
      
      // Monitor stand
      const monitorStand = new THREE.Mesh(monitorStandGeometry, monitorMaterial);
      monitorStand.position.set(pos[0], pos[1] + 0.95, pos[2] - 0.3);
      labGroup.add(monitorStand);
      
      // Monitor
      const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
      monitor.position.set(pos[0], pos[1] + 1.2, pos[2] - 0.3);
      labGroup.add(monitor);
      
      // Monitor screen
      const monitorScreen = new THREE.Mesh(monitorScreenGeometry, monitorScreenMaterial);
      monitorScreen.position.set(pos[0], pos[1] + 1.2, pos[2] - 0.27);
      labGroup.add(monitorScreen);
      
      // Keyboard
      const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
      keyboard.position.set(pos[0], pos[1] + 0.75, pos[2]);
      labGroup.add(keyboard);
      
      // Mouse
      const mouse = new THREE.Mesh(mouseGeometry, mouseMaterial);
      mouse.position.set(pos[0] + 0.35, pos[1] + 0.75, pos[2]);
      labGroup.add(mouse);
      
      // Chair
      const chair = new THREE.Mesh(chairGeometry, chairMaterial);
      chair.position.set(pos[0], pos[1] + 0.35, pos[2] + 0.7);
      labGroup.add(chair);
      
      // Chair leg
      const chairLeg = new THREE.Mesh(chairLegGeometry, chairMaterial);
      chairLeg.position.set(pos[0], pos[1] + 0.35 - 0.35, pos[2] + 0.7);
      labGroup.add(chairLeg);
      
      // Chair back
      const chairBack = new THREE.Mesh(chairBackGeometry, chairMaterial);
      chairBack.position.set(pos[0], pos[1] + 0.7, pos[2] + 1);
      labGroup.add(chairBack);
    });
  }
  
  // Menambahkan rack server
  addServerRack(labGroup) {
    const rackGeometry = new THREE.BoxGeometry(1.5, 3, 0.8);
    const rackMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.5,
      roughness: 0.7
    });
    
    const rack = new THREE.Mesh(rackGeometry, rackMaterial);
    rack.position.set(-5, 1.5, -4);
    rack.castShadow = true;
    rack.receiveShadow = true;
    labGroup.add(rack);
    
    // Tambahkan detail server
    const serverGeometry = new THREE.BoxGeometry(1.4, 0.2, 0.7);
    const serverMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.6,
      roughness: 0.4
    });
    
    const ledGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    const ledOnMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 2
    });
    
    const ledOffMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      emissive: 0x003300,
      emissiveIntensity: 0.2
    });
    
    // Tambahkan beberapa server ke rack
    for (let i = 0; i < 8; i++) {
      const server = new THREE.Mesh(serverGeometry, serverMaterial);
      server.position.set(-5, 0.5 + i * 0.3, -4);
      server.castShadow = true;
      server.receiveShadow = true;
      labGroup.add(server);
      
      // Tambahkan LED
      for (let j = 0; j < 4; j++) {
        const ledMaterial = Math.random() > 0.3 ? ledOnMaterial : ledOffMaterial;
        const led = new THREE.Mesh(ledGeometry, ledMaterial);
        led.position.set(-5.65 + j * 0.05, 0.5 + i * 0.3, -3.7);
        led.scale.set(3, 3, 3); // Perbesar LED untuk mempermudah melihatnya
        labGroup.add(led);
      }
    }
    
    // Tambahkan lampu untuk server area
    const pointLight = new THREE.PointLight(0x66aaff, 1, 5);
    pointLight.position.set(-5, 3, -4);
    labGroup.add(pointLight);
  }
  
  // Dummy models untuk lokasi lain
  createLibraryModel() {
    const library = new THREE.Group();
    library.name = "library";
    
    // Basic room setup
    this.createBasicRoom(library, 20, 15, 0x8B4513);
    
    // Add bookshelves, tables, and chairs later
    
    return library;
  }
  
  createCreativeSpaceModel() {
    const creativeSpace = new THREE.Group();
    creativeSpace.name = "creative-space";
    
    // Basic room setup
    this.createBasicRoom(creativeSpace, 18, 18, 0xeeeeee);
    
    // Add furniture and creative elements later
    
    return creativeSpace;
  }
  
  createHallModel() {
    const hall = new THREE.Group();
    hall.name = "hall";
    
    // Basic room setup
    this.createBasicRoom(hall, 25, 20, 0xdddddd);
    
    // Add stage, chairs, etc later
    
    return hall;
  }
  
  // Helper untuk membuat struktur ruangan dasar
  createBasicRoom(group, width, depth, floorColor) {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(width, depth);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: floorColor,
      metalness: 0.1,
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    group.add(floor);
    
    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      metalness: 0.1,
      roughness: 0.8
    });
    
    // Front wall
    const frontWallGeometry = new THREE.BoxGeometry(width, 4, 0.2);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, 2, depth / 2);
    frontWall.castShadow = true;
    frontWall.receiveShadow = true;
    group.add(frontWall);
    
    // Back wall
    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.position.set(0, 2, -depth / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    group.add(backWall);
    
    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(0.2, 4, depth);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-width / 2, 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    group.add(leftWall);
    
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(width / 2, 2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    group.add(rightWall);
    
    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4;
    ceiling.receiveShadow = true;
    group.add(ceiling);
    
    // Add basic lighting
    for (let x = -width / 4; x <= width / 4; x += width / 4) {
      for (let z = -depth / 4; z <= depth / 4; z += depth / 4) {
        const light = new THREE.PointLight(0xffffcc, 0.5, 8);
        light.position.set(x, 3.8, z);
        group.add(light);
      }
    }
  }
}

export default ModelsManager;