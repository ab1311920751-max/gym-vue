/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80012 (8.0.12)
 Source Host           : localhost:3306
 Source Schema         : gym_db

 Target Server Type    : MySQL
 Target Server Version : 80012 (8.0.12)
 File Encoding         : 65001

 Date: 07/02/2026 10:33:21
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for course_booking
-- ----------------------------
DROP TABLE IF EXISTS `course_booking`;
CREATE TABLE `course_booking`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `course_id` bigint(20) NOT NULL COMMENT '课程ID',
  `status` int(11) NULL DEFAULT 0 COMMENT '状态: 0-已预约, 1-已取消, 2-已签到',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '预约时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '预约记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of course_booking
-- ----------------------------
INSERT INTO `course_booking` VALUES (1, 1, 1, 0, '2026-02-06 23:53:39');
INSERT INTO `course_booking` VALUES (2, 2, 1, 0, '2026-02-07 10:24:38');
INSERT INTO `course_booking` VALUES (3, 2, 2, 0, '2026-02-07 10:24:39');
INSERT INTO `course_booking` VALUES (4, 2, 3, 0, '2026-02-07 10:24:39');

-- ----------------------------
-- Table structure for gym_course
-- ----------------------------
DROP TABLE IF EXISTS `gym_course`;
CREATE TABLE `gym_course`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '课程名称',
  `coach` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '教练姓名',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '课程介绍',
  `start_time` datetime NOT NULL COMMENT '上课时间',
  `capacity` int(11) NULL DEFAULT 20 COMMENT '最大人数',
  `price` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '价格',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '健身课程表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of gym_course
-- ----------------------------
INSERT INTO `gym_course` VALUES (1, '燃脂搏击操', '杰克教练', '高强度有氧，快速燃烧卡路里', '2026-06-01 18:00:00', 20, 0.00, '2026-02-06 23:39:49');
INSERT INTO `gym_course` VALUES (2, '舒缓瑜伽', 'Lisa老师', '拉伸肌肉，放松身心', '2026-06-02 10:00:00', 15, 0.00, '2026-02-06 23:39:49');
INSERT INTO `gym_course` VALUES (3, '力量举重', '施瓦辛格', '核心力量训练，增肌必备', '2026-06-03 15:00:00', 10, 0.00, '2026-02-06 23:39:49');

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码(明文存储为了简单，答辩说哈希加密即可)',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '昵称',
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'user' COMMENT '角色: admin/user',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES (1, 'admin', '123456', '系统管理员', 'admin', '2026-02-04 16:37:03');
INSERT INTO `sys_user` VALUES (2, 'laixu', '123456', '健身达人', 'user', '2026-02-07 10:24:30');

SET FOREIGN_KEY_CHECKS = 1;
