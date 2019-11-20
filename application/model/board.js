'use strict';

const boardSchema = require('./schema/board');

class Board {
    setPost(post) {
        return new Promise(async (resolve, reject) => {
            const newPost = new boardSchema({ ...post });
            try {
                const result = await newPost.save();
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    getAllPosts() {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await boardSchema.find().sort('-recommend -date');
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    // 개발 필요
    recommend(id, userName) {
        return new Promise(async (resolve, reject) => {
            try {

                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    // 상세보기 (추후 개발)
    getPost(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await boardSchema.findById(id);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Board();