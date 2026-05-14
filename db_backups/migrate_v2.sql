-- =============================================
-- 迁移脚本：密码字段扩展 + 状态注释修正
-- 执行前提：已有 gym_db 数据库
-- =============================================

-- 1. 扩展密码字段长度以支持 BCrypt 哈希（60字符）
ALTER TABLE `sys_user` MODIFY COLUMN `password` varchar(255) NOT NULL COMMENT '密码(BCrypt哈希存储)';

-- 2. 修正 course_booking.status 注释（原注释与代码不一致）
ALTER TABLE `course_booking` MODIFY COLUMN `status` int(11) NULL DEFAULT 0 COMMENT '状态: 0-待支付, 1-已支付, 2-已取消';
