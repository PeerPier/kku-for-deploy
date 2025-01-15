import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../common/firebase";


export const uploadProfileImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `profile-images/${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL; // URL สำหรับบันทึกในฐานข้อมูล
};

export const uploadImage = async (file: File): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const storageRef = ref(storage, `images/${fileName}`);

  // อัปโหลดไฟล์
  await uploadBytes(storageRef, file);

  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
