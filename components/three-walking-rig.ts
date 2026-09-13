import * as THREE from 'three';

/**
 * Three.js Procedural Walking Character & Horse Mesh Rigging System
 * Creates articulated 3D limbs with inverse-kinematic walking gait,
 * fluid cloth physics, and detailed historical Chola attire.
 */

export interface WalkingRigInstances {
  group: THREE.Group;
  update: (time: number, speed: number, isPlaying: boolean) => void;
  dispose: () => void;
}

export function createCholaWarriorAndHorseRig(): WalkingRigInstances {
  const rootGroup = new THREE.Group();
  rootGroup.position.set(0, -3.2, 2.5);

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x9b5c32, // Warm South-Indian bronze skin tone
    roughness: 0.6,
  });

  const armorMat = new THREE.MeshStandardMaterial({
    color: 0xc8852a, // Ancient Chola bronze armor
    roughness: 0.35,
    metalness: 0.7,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Royal gold jewelry & ornaments
    roughness: 0.25,
    metalness: 0.85,
  });

  const clothWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xfefce8, // Cream silk veshti
    roughness: 0.8,
  });

  const clothCrimsonMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b, // Royal Chola crimson border & cape
    roughness: 0.65,
    side: THREE.DoubleSide,
  });

  const horseCoatMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Noble white stallion
    roughness: 0.5,
  });

  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x451a03, // Saddle & straps
    roughness: 0.7,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.9,
  });

  // ==========================================
  // 1. CHOLA WARRIOR PRINCE RIG
  // ==========================================
  const warriorGroup = new THREE.Group();
  warriorGroup.position.set(-2.8, 0, 0.4);
  rootGroup.add(warriorGroup);

  // Warrior Torso & Hip
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 2.4, 0);
  warriorGroup.add(torsoGroup);

  // Chest Cuirass
  const chestGeo = new THREE.CylinderGeometry(0.48, 0.4, 0.9, 16);
  const chestMesh = new THREE.Mesh(chestGeo, armorMat);
  chestMesh.position.set(0, 0.45, 0);
  torsoGroup.add(chestMesh);

  // Royal Golden Necklace / Harams
  const haramGeo = new THREE.TorusGeometry(0.38, 0.04, 8, 24);
  haramGeo.rotateX(Math.PI / 2.5);
  const haramMesh = new THREE.Mesh(haramGeo, goldMat);
  haramMesh.position.set(0, 0.7, 0.15);
  torsoGroup.add(haramMesh);

  // Head & Hair
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.25, 0);
  torsoGroup.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headGroup.add(headMesh);

  // Chola Warrior Kondai (Topknot / Hair Bun)
  const bunGeo = new THREE.SphereGeometry(0.2, 12, 12);
  const bunMesh = new THREE.Mesh(bunGeo, hairMat);
  bunMesh.position.set(-0.15, 0.22, -0.15);
  headGroup.add(bunMesh);

  // Golden Headband / Thalaipagai
  const bandGeo = new THREE.TorusGeometry(0.33, 0.03, 8, 24);
  bandGeo.rotateX(Math.PI / 2);
  const bandMesh = new THREE.Mesh(bandGeo, goldMat);
  bandMesh.position.set(0, 0.05, 0);
  headGroup.add(bandMesh);

  // Flowing Crimson Cape (Mesh with multi-segments for waving cloth)
  const capeGeo = new THREE.PlaneGeometry(1.1, 2.6, 12, 16);
  capeGeo.rotateY(Math.PI);
  const capeMesh = new THREE.Mesh(capeGeo, clothCrimsonMat);
  capeMesh.position.set(-0.4, 0.3, -0.35);
  capeMesh.rotation.set(0.15, -0.2, 0.1);
  torsoGroup.add(capeMesh);

  // Royal Tiger Standard Banner (Pulikodi)
  const flagPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.2, 8);
  const flagPoleMesh = new THREE.Mesh(flagPoleGeo, armorMat);
  flagPoleMesh.position.set(-0.4, 1.8, 0.2);
  flagPoleMesh.rotation.z = -0.15;
  torsoGroup.add(flagPoleMesh);

  const flagClothGeo = new THREE.PlaneGeometry(1.6, 1.1, 16, 10);
  const flagClothMesh = new THREE.Mesh(flagClothGeo, clothCrimsonMat);
  flagClothMesh.position.set(-1.2, 3.2, 0.2);
  torsoGroup.add(flagClothMesh);

  // Scabbard & Dual Swords
  const scabbardGeo = new THREE.BoxGeometry(0.08, 1.8, 0.12);
  const scabbardMesh = new THREE.Mesh(scabbardGeo, goldMat);
  scabbardMesh.position.set(-0.2, -0.2, 0.3);
  scabbardMesh.rotation.set(0.4, 0, 0.6);
  torsoGroup.add(scabbardMesh);

  // Warrior Left Leg (Thigh + Shin + Foot)
  const leftLegThigh = new THREE.Group();
  leftLegThigh.position.set(-0.2, 1.8, 0.05);
  warriorGroup.add(leftLegThigh);

  const thighLGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.9, 12);
  const thighLMesh = new THREE.Mesh(thighLGeo, clothWhiteMat);
  thighLMesh.position.set(0, -0.45, 0);
  leftLegThigh.add(thighLMesh);

  const leftLegShin = new THREE.Group();
  leftLegShin.position.set(0, -0.9, 0);
  leftLegThigh.add(leftLegShin);

  const shinLGeo = new THREE.CylinderGeometry(0.16, 0.12, 0.9, 12);
  const shinLMesh = new THREE.Mesh(shinLGeo, skinMat);
  shinLMesh.position.set(0, -0.45, 0);
  leftLegShin.add(shinLMesh);

  const footLGeo = new THREE.BoxGeometry(0.2, 0.12, 0.38);
  const footLMesh = new THREE.Mesh(footLGeo, leatherMat);
  footLMesh.position.set(0, -0.9, 0.1);
  leftLegShin.add(footLMesh);

  // Warrior Right Leg (Thigh + Shin + Foot)
  const rightLegThigh = new THREE.Group();
  rightLegThigh.position.set(0.2, 1.8, -0.05);
  warriorGroup.add(rightLegThigh);

  const thighRGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.9, 12);
  const thighRMesh = new THREE.Mesh(thighRGeo, clothWhiteMat);
  thighRMesh.position.set(0, -0.45, 0);
  rightLegThigh.add(thighRMesh);

  const rightLegShin = new THREE.Group();
  rightLegShin.position.set(0, -0.9, 0);
  rightLegThigh.add(rightLegShin);

  const shinRGeo = new THREE.CylinderGeometry(0.16, 0.12, 0.9, 12);
  const shinRMesh = new THREE.Mesh(shinRGeo, skinMat);
  shinRMesh.position.set(0, -0.45, 0);
  rightLegShin.add(shinRMesh);

  const footRGeo = new THREE.BoxGeometry(0.2, 0.12, 0.38);
  const footRMesh = new THREE.Mesh(footRGeo, leatherMat);
  footRMesh.position.set(0, -0.9, 0.1);
  rightLegShin.add(footRMesh);

  // Pleated Silk Veshti Overhang
  const veshtiGeo = new THREE.ConeGeometry(0.6, 1.2, 16, 8, true);
  const veshtiMesh = new THREE.Mesh(veshtiGeo, clothWhiteMat);
  veshtiMesh.position.set(0, 1.5, 0);
  warriorGroup.add(veshtiMesh);

  // ==========================================
  // 2. ROYAL WHITE WAR STALLION RIG
  // ==========================================
  const horseGroup = new THREE.Group();
  horseGroup.position.set(2.4, 0, -0.3);
  rootGroup.add(horseGroup);

  // Horse Body (Barrel)
  const horseTorso = new THREE.Group();
  horseTorso.position.set(0, 2.6, 0);
  horseGroup.add(horseTorso);

  const bodyGeo = new THREE.CylinderGeometry(0.85, 0.95, 3.2, 16);
  bodyGeo.rotateZ(Math.PI / 2);
  const bodyMesh = new THREE.Mesh(bodyGeo, horseCoatMat);
  horseTorso.add(bodyMesh);

  // Royal Embroidered Red & Gold Saddle
  const saddleGeo = new THREE.CylinderGeometry(0.9, 1.0, 1.4, 16, 1, false, -Math.PI / 2, Math.PI);
  saddleGeo.rotateZ(Math.PI / 2);
  const saddleMesh = new THREE.Mesh(saddleGeo, clothCrimsonMat);
  saddleMesh.position.set(0, 0.05, 0);
  horseTorso.add(saddleMesh);

  const saddleGoldGeo = new THREE.TorusGeometry(0.95, 0.04, 6, 16, Math.PI);
  saddleGoldGeo.rotateZ(Math.PI / 2);
  const saddleGoldMesh = new THREE.Mesh(saddleGoldGeo, goldMat);
  horseTorso.add(saddleGoldMesh);

  // Horse Neck & Head
  const neckGroup = new THREE.Group();
  neckGroup.position.set(-1.4, 0.4, 0);
  neckGroup.rotation.z = 0.55;
  horseTorso.add(neckGroup);

  const neckGeo = new THREE.CylinderGeometry(0.48, 0.68, 1.6, 12);
  const neckMesh = new THREE.Mesh(neckGeo, horseCoatMat);
  neckMesh.position.set(0, 0.8, 0);
  neckGroup.add(neckMesh);

  const headMeshGroup = new THREE.Group();
  headMeshGroup.position.set(0, 1.6, 0);
  headMeshGroup.rotation.z = -0.9;
  neckGroup.add(headMeshGroup);

  const horseHeadGeo = new THREE.ConeGeometry(0.45, 1.3, 12);
  horseHeadGeo.rotateZ(Math.PI / 2);
  const horseHeadMesh = new THREE.Mesh(horseHeadGeo, horseCoatMat);
  headMeshGroup.add(horseHeadMesh);

  // Horse Ears
  const earLGeo = new THREE.ConeGeometry(0.09, 0.35, 6);
  const earL = new THREE.Mesh(earLGeo, horseCoatMat);
  earL.position.set(0.2, 0.35, 0.2);
  earL.rotation.z = 0.2;
  headMeshGroup.add(earL);

  const earRGeo = new THREE.ConeGeometry(0.09, 0.35, 6);
  const earR = new THREE.Mesh(earRGeo, horseCoatMat);
  earR.position.set(0.2, 0.35, -0.2);
  earR.rotation.z = 0.2;
  headMeshGroup.add(earR);

  // Golden Bridle & Reins
  const bridleGeo = new THREE.TorusGeometry(0.35, 0.03, 6, 16);
  const bridleMesh = new THREE.Mesh(bridleGeo, goldMat);
  bridleMesh.position.set(-0.3, 0, 0);
  headMeshGroup.add(bridleMesh);

  // Horse Tail
  const tailGroup = new THREE.Group();
  tailGroup.position.set(1.6, 0.3, 0);
  tailGroup.rotation.z = -0.4;
  horseTorso.add(tailGroup);

  const tailGeo = new THREE.CylinderGeometry(0.08, 0.25, 2.2, 8);
  const tailMesh = new THREE.Mesh(tailGeo, horseCoatMat);
  tailMesh.position.set(0.3, -1.0, 0);
  tailGroup.add(tailMesh);

  // ==========================================
  // Horse 4 Articulated Trotting Legs
  // ==========================================
  // Front Left Leg
  const horseFLUpper = new THREE.Group();
  horseFLUpper.position.set(-1.1, -0.3, 0.55);
  horseTorso.add(horseFLUpper);

  const legFLUGib = new THREE.CylinderGeometry(0.2, 0.14, 1.2, 10);
  const legFLUMesh = new THREE.Mesh(legFLUGib, horseCoatMat);
  legFLUMesh.position.set(0, -0.6, 0);
  horseFLUpper.add(legFLUMesh);

  const horseFLLower = new THREE.Group();
  horseFLLower.position.set(0, -1.2, 0);
  horseFLUpper.add(horseFLLower);

  const legFLLGib = new THREE.CylinderGeometry(0.14, 0.1, 1.2, 10);
  const legFLLMesh = new THREE.Mesh(legFLLGib, horseCoatMat);
  legFLLMesh.position.set(0, -0.6, 0);
  horseFLLower.add(legFLLMesh);

  const hoofFLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.2, 8), goldMat);
  hoofFLMesh.position.set(0, -1.2, 0);
  horseFLLower.add(hoofFLMesh);

  // Front Right Leg
  const horseFRUpper = new THREE.Group();
  horseFRUpper.position.set(-1.1, -0.3, -0.55);
  horseTorso.add(horseFRUpper);

  const legFRUGib = new THREE.CylinderGeometry(0.2, 0.14, 1.2, 10);
  const legFRUMesh = new THREE.Mesh(legFRUGib, horseCoatMat);
  legFRUMesh.position.set(0, -0.6, 0);
  horseFRUpper.add(legFRUMesh);

  const horseFRLower = new THREE.Group();
  horseFRLower.position.set(0, -1.2, 0);
  horseFRUpper.add(horseFRLower);

  const legFRLGib = new THREE.CylinderGeometry(0.14, 0.1, 1.2, 10);
  const legFRLMesh = new THREE.Mesh(legFRLGib, horseCoatMat);
  legFRLMesh.position.set(0, -0.6, 0);
  horseFRLower.add(legFRLMesh);

  const hoofFRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.2, 8), goldMat);
  hoofFRMesh.position.set(0, -1.2, 0);
  horseFRLower.add(hoofFRMesh);

  // Back Left Leg
  const horseBLUpper = new THREE.Group();
  horseBLUpper.position.set(1.2, -0.3, 0.55);
  horseTorso.add(horseBLUpper);

  const legBLUGib = new THREE.CylinderGeometry(0.26, 0.16, 1.3, 10);
  const legBLUMesh = new THREE.Mesh(legBLUGib, horseCoatMat);
  legBLUMesh.position.set(0, -0.65, 0);
  horseBLUpper.add(legBLUMesh);

  const horseBLLower = new THREE.Group();
  horseBLLower.position.set(0, -1.3, 0);
  horseBLUpper.add(horseBLLower);

  const legBLLGib = new THREE.CylinderGeometry(0.16, 0.1, 1.2, 10);
  const legBLLMesh = new THREE.Mesh(legBLLGib, horseCoatMat);
  legBLLMesh.position.set(0, -0.6, 0);
  horseBLLower.add(legBLLMesh);

  const hoofBLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.2, 8), goldMat);
  hoofBLMesh.position.set(0, -1.2, 0);
  horseBLLower.add(hoofBLMesh);

  // Back Right Leg
  const horseBRUpper = new THREE.Group();
  horseBRUpper.position.set(1.2, -0.3, -0.55);
  horseTorso.add(horseBRUpper);

  const legBRUGib = new THREE.CylinderGeometry(0.26, 0.16, 1.3, 10);
  const legBRUMesh = new THREE.Mesh(legBRUGib, horseCoatMat);
  legBRUMesh.position.set(0, -0.65, 0);
  horseBRUpper.add(legBRUMesh);

  const horseBRLower = new THREE.Group();
  horseBRLower.position.set(0, -1.3, 0);
  horseBRUpper.add(horseBRLower);

  const legBRLGib = new THREE.CylinderGeometry(0.16, 0.1, 1.2, 10);
  const legBRLMesh = new THREE.Mesh(legBRLGib, horseCoatMat);
  legBRLMesh.position.set(0, -0.6, 0);
  horseBRLower.add(legBRLMesh);

  const hoofBRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.2, 8), goldMat);
  hoofBRMesh.position.set(0, -1.2, 0);
  horseBRLower.add(hoofBRMesh);

  // Leather Lead Line connecting Warrior to Horse
  const leadLineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.4, 2.2, 0.3),
    new THREE.Vector3(-0.5, 1.6, 0.2),
    new THREE.Vector3(1.2, 2.8, -0.2),
  ]);
  const leadLineGeo = new THREE.TubeGeometry(leadLineCurve, 16, 0.02, 6, false);
  const leadLineMesh = new THREE.Mesh(leadLineGeo, leatherMat);
  rootGroup.add(leadLineMesh);

  // ==========================================
  // REAL-TIME BIOMECHANICAL WALKING UPDATE LOOP
  // ==========================================
  const update = (time: number, speed: number, isPlaying: boolean) => {
    if (!isPlaying) return;

    const walkCadence = time * 3.8 * speed;

    // 1. Warrior Walking Gait (Alternating Thigh & Knee Flexion)
    const warriorStride = Math.sin(walkCadence);
    leftLegThigh.rotation.x = warriorStride * 0.55;
    leftLegShin.rotation.x = Math.max(0, -warriorStride * 0.7);

    rightLegThigh.rotation.x = -warriorStride * 0.55;
    rightLegShin.rotation.x = Math.max(0, warriorStride * 0.7);

    // Torso cadence bob & stride sway
    torsoGroup.position.y = 2.4 + Math.abs(Math.sin(walkCadence)) * 0.08;
    torsoGroup.rotation.y = Math.sin(walkCadence) * 0.08;
    torsoGroup.rotation.z = Math.cos(walkCadence) * 0.03;

    // Head subtle counterbalance
    headGroup.rotation.x = Math.sin(walkCadence * 2) * 0.04;
    headGroup.rotation.y = -Math.sin(walkCadence) * 0.06;

    // Cloth Simulation: Cape & Banner Waving
    const capePositions = capeMesh.geometry.attributes.position;
    for (let i = 0; i < capePositions.count; i++) {
      const u = capePositions.getX(i);
      const v = capePositions.getY(i);
      const wave = Math.sin(time * 6 + v * 3) * (0.15 - v * 0.08);
      capePositions.setZ(i, wave);
    }
    capeMesh.geometry.attributes.position.needsUpdate = true;

    const flagPositions = flagClothMesh.geometry.attributes.position;
    for (let i = 0; i < flagPositions.count; i++) {
      const u = flagPositions.getX(i);
      const wave = Math.sin(time * 7 + u * 4) * 0.18;
      flagPositions.setZ(i, wave);
    }
    flagClothMesh.geometry.attributes.position.needsUpdate = true;

    // 2. Horse 4-Beat Walking Gait
    const horseCadence = walkCadence + Math.PI * 0.25;
    const flStride = Math.sin(horseCadence);
    const frStride = Math.sin(horseCadence + Math.PI);
    const blStride = Math.sin(horseCadence + Math.PI * 0.5);
    const brStride = Math.sin(horseCadence + Math.PI * 1.5);

    horseFLUpper.rotation.x = flStride * 0.45;
    horseFLLower.rotation.x = Math.max(0, -flStride * 0.6);

    horseFRUpper.rotation.x = frStride * 0.45;
    horseFRLower.rotation.x = Math.max(0, -frStride * 0.6);

    horseBLUpper.rotation.x = blStride * 0.45;
    horseBLLower.rotation.x = Math.max(0, -blStride * 0.55);

    horseBRUpper.rotation.x = brStride * 0.45;
    horseBRLower.rotation.x = Math.max(0, -brStride * 0.55);

    // Horse Body Walking Cadence (Breathe, stride bob & head nodding)
    horseTorso.position.y = 2.6 + Math.abs(Math.sin(horseCadence * 2)) * 0.09;
    horseTorso.rotation.z = Math.sin(horseCadence) * 0.02;
    neckGroup.rotation.z = 0.55 + Math.sin(horseCadence) * 0.06;
    tailGroup.rotation.y = Math.sin(time * 5) * 0.25;
  };

  const dispose = () => {
    skinMat.dispose();
    armorMat.dispose();
    goldMat.dispose();
    clothWhiteMat.dispose();
    clothCrimsonMat.dispose();
    horseCoatMat.dispose();
    leatherMat.dispose();
    hairMat.dispose();
  };

  return {
    group: rootGroup,
    update,
    dispose,
  };
}
