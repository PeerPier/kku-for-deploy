const mongoose = require("mongoose");
const User = require("../models/user");

function jaccardSimilarity(setA, setB) {
    const intersection = new Set([...setA].filter(x => setB.has(x)));  
    const union = new Set([...setA, ...setB]);  
    return intersection.size / union.size; 
}
//ฟังก์ชัน recommend และการตรวจสอบรูปแบบ userId
async function recommend(userId, topN = 3) {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error("Invalid userId format");
        return [];
    }
    //การรวบรวมโพสต์ที่ผู้ใช้โต้ตอบ
    const user = await User.findById(userId, 'viewed_posts liked_posts saved_posts commented_posts').lean();
    if (!user) return [];  

    const interactedPosts = new Set([
        ...user.viewed_posts,
        ...user.liked_posts,
        ...user.saved_posts,
        ...user.commented_posts
    ]);

    //รวบรวมข้อมูลการโต้ตอบของผู้ใช้ทุกคนกับโพสต์
    const postInteractions = {};
    const userCollection = await User.aggregate([
        { $project: { 
            _id: 1, 
            posts: { $setUnion: ["$viewed_posts", "$liked_posts", "$saved_posts", "$commented_posts"] } 
        }},
        { $unwind: "$posts" },
        { $group: { 
            _id: "$posts", 
            users: { $addToSet: "$_id" }
        }}
    ]);

    //สร้างข้อมูลการโต้ตอบของโพสต์
    userCollection.forEach(post => {
        postInteractions[post._id] = new Set(post.users.map(userId => userId.toString()));
    });

    //คำนวณ Jaccard Similarity สำหรับโพสต์ทั้งหมด
    const postIds = Object.keys(postInteractions);
    const similarities = {};

    for (let i = 0; i < postIds.length; i++) {
        for (let j = i + 1; j < postIds.length; j++) {
            const postA = postIds[i];
            const postB = postIds[j];
            const similarity = jaccardSimilarity(postInteractions[postA], postInteractions[postB]);
            similarities[`${postA}-${postB}`] = similarity;
        }
    }
    
    //คำนวณคะแนนการแนะนำสำหรับโพสต์
    const recommendationScores = {};
    Object.keys(similarities).forEach(pair => {
        const [postA, postB] = pair.split("-");

        if (interactedPosts.has(postA) && !interactedPosts.has(postB)) {
            if (!recommendationScores[postB]) recommendationScores[postB] = 0;
            recommendationScores[postB] += similarities[pair];
        }

        if (interactedPosts.has(postB) && !interactedPosts.has(postA)) {
            if (!recommendationScores[postA]) recommendationScores[postA] = 0;
            recommendationScores[postA] += similarities[pair];
        }
    });

    return Object.entries(recommendationScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([post, _]) => post);
}

module.exports = recommend;
