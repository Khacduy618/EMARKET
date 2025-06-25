<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_chat_conversations_meta', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // UserID của người dùng này (chủ sở hữu metadata)
            $table->string('mongo_conversation_id', 24)->comment('ID của Conversation từ MongoDB'); // MongoDB ObjectId là 24 hex chars
            $table->unsignedBigInteger('other_user_id')->comment('UserID của người chat cùng trong cuộc trò chuyện 1-1');

            $table->string('other_user_username', 100)->nullable();
            $table->string('other_user_avatar', 512)->nullable(); // Tăng độ dài nếu cần
            $table->string('last_message_preview', 255)->nullable();
            $table->timestamp('last_message_at_mysql')->nullable();
            $table->unsignedInteger('unread_count_mysql')->default(0);

            // $table->timestamps(); // Mongoose đã có createdAt, updatedAt cho Conversation chính
            // Chúng ta sẽ dùng UpdatedAt của Laravel cho bản ghi meta này
            $table->timestamp('updated_at_mysql')->useCurrent()->useCurrentOnUpdate();
            $table->timestamp('created_at_mysql')->useCurrent();


            $table->unique(['user_id', 'mongo_conversation_id'], 'user_mongo_convo_unique');

            $table->foreign('user_id')->references('UserID')->on('Users')->onDelete('cascade'); // Giả sử cột ID trong bảng users là UserID
            $table->foreign('other_user_id')->references('UserID')->on('Users')->onDelete('cascade');

            $table->index('mongo_conversation_id');
            $table->index('last_message_at_mysql');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_chat_conversations_meta');
    }
};