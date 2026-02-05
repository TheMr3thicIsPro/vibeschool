module.exports = [
"[project]/src/community/db/LocalDB.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LocalDB",
    ()=>LocalDB
]);
class LocalDB {
    storageKey = 'vibeschool-community-data';
    DEBUG_COMMUNITY = process.env.DEBUG_COMMUNITY === 'true';
    constructor(){
        // Initialize with default data if not exists
        this.initStorage();
    }
    initStorage() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    getData() {
        if ("TURBOPACK compile-time truthy", 1) {
            return {
                profiles: [],
                friendRequests: [],
                friends: [],
                conversations: [],
                conversationMembers: [],
                messages: [],
                blocks: [],
                reports: [],
                typingIndicators: {}
            };
        }
        //TURBOPACK unreachable
        ;
        const dataStr = undefined;
    }
    setData(data) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    // Profiles
    async getProfile(userId) {
        const data = this.getData();
        const profile = data.profiles.find((p)=>p.id === userId) || null;
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] getProfile', {
                userId,
                profile: profile ? 'found' : 'not found'
            });
        }
        return profile;
    }
    async updateProfile(userId, data) {
        const currentData = this.getData();
        const existingIndex = currentData.profiles.findIndex((p)=>p.id === userId);
        if (existingIndex !== -1) {
            currentData.profiles[existingIndex] = {
                ...currentData.profiles[existingIndex],
                ...data,
                last_seen_at: new Date().toISOString()
            };
        } else {
            const newProfile = {
                id: userId,
                username: data.username || '',
                display_name: data.display_name || '',
                avatar_url: data.avatar_url,
                role: data.role || 'student',
                created_at: new Date().toISOString(),
                last_seen_at: new Date().toISOString(),
                is_online: false
            };
            currentData.profiles.push(newProfile);
        }
        this.setData(currentData);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] updateProfile', {
                userId,
                data
            });
        }
        return currentData.profiles.find((p)=>p.id === userId);
    }
    async searchProfiles(query) {
        const data = this.getData();
        const lowerQuery = query.toLowerCase();
        const results = data.profiles.filter((p)=>p.username.toLowerCase().includes(lowerQuery) || p.display_name.toLowerCase().includes(lowerQuery));
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] searchProfiles', {
                query,
                results: results.length
            });
        }
        return results;
    }
    // Friend Requests
    async createFriendRequest(requesterId, addresseeId) {
        const currentData = this.getData();
        const newRequest = {
            id: crypto.randomUUID(),
            requester_id: requesterId,
            addressee_id: addresseeId,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        currentData.friendRequests.push(newRequest);
        this.setData(currentData);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] createFriendRequest', {
                requesterId,
                addresseeId,
                requestId: newRequest.id
            });
        }
        return newRequest;
    }
    async updateFriendRequest(requestId, status) {
        const currentData = this.getData();
        const index = currentData.friendRequests.findIndex((r)=>r.id === requestId);
        if (index !== -1) {
            currentData.friendRequests[index].status = status;
            currentData.friendRequests[index].updated_at = new Date().toISOString();
            // If accepted, create friendship entries
            if (status === 'accepted') {
                const request = currentData.friendRequests[index];
                const friendEntry1 = {
                    user_id: request.requester_id,
                    friend_id: request.addressee_id,
                    created_at: new Date().toISOString()
                };
                const friendEntry2 = {
                    user_id: request.addressee_id,
                    friend_id: request.requester_id,
                    created_at: new Date().toISOString()
                };
                currentData.friends.push(friendEntry1, friendEntry2);
            }
            this.setData(currentData);
            if (this.DEBUG_COMMUNITY) {
                console.log('[COMMUNITY][LocalDB] updateFriendRequest', {
                    requestId,
                    status
                });
            }
            return currentData.friendRequests[index];
        }
        throw new Error('Friend request not found');
    }
    async getFriendRequests(userId) {
        const data = this.getData();
        const requests = data.friendRequests.filter((r)=>r.addressee_id === userId || r.requester_id === userId);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] getFriendRequests', {
                userId,
                count: requests.length
            });
        }
        return requests;
    }
    // Friends
    async getFriends(userId) {
        const data = this.getData();
        const friends = data.friends.filter((f)=>f.user_id === userId);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] getFriends', {
                userId,
                count: friends.length
            });
        }
        return friends;
    }
    async unfriend(userId, friendId) {
        const currentData = this.getData();
        currentData.friends = currentData.friends.filter((f)=>!(f.user_id === userId && f.friend_id === friendId) || !(f.user_id === friendId && f.friend_id === userId));
        this.setData(currentData);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] unfriend', {
                userId,
                friendId
            });
        }
    }
    // Conversations
    async createConversation(isGroup, createdBy, title, userIds) {
        const currentData = this.getData();
        const newConversation = {
            id: crypto.randomUUID(),
            is_group: isGroup,
            title: title || (isGroup ? 'Group Chat' : undefined),
            created_by: createdBy,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        currentData.conversations.push(newConversation);
        // Add creator as member
        const creatorMember = {
            conversation_id: newConversation.id,
            user_id: createdBy,
            role: 'owner',
            joined_at: new Date().toISOString()
        };
        currentData.conversationMembers.push(creatorMember);
        // Add other users if provided
        if (userIds) {
            for (const userId of userIds){
                if (userId !== createdBy) {
                    const member = {
                        conversation_id: newConversation.id,
                        user_id: userId,
                        role: 'member',
                        joined_at: new Date().toISOString()
                    };
                    currentData.conversationMembers.push(member);
                }
            }
        }
        this.setData(currentData);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] createConversation', {
                isGroup,
                createdBy,
                title,
                userIds,
                conversationId: newConversation.id
            });
        }
        return newConversation;
    }
    async getConversations(userId) {
        const data = this.getData();
        const userConversations = data.conversationMembers.filter((cm)=>cm.user_id === userId).map((cm)=>cm.conversation_id);
        const conversations = data.conversations.filter((c)=>userConversations.includes(c.id));
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] getConversations', {
                userId,
                count: conversations.length
            });
        }
        return conversations;
    }
    async getConversation(conversationId) {
        const data = this.getData();
        const conversation = data.conversations.find((c)=>c.id === conversationId) || null;
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] getConversation', {
                conversationId,
                found: !!conversation
            });
        }
        return conversation;
    }
    async addConversationMember(conversationId, userId, role = 'member') {
        const currentData = this.getData();
        const existingMember = currentData.conversationMembers.find((cm)=>cm.conversation_id === conversationId && cm.user_id === userId);
        if (!existingMember) {
            const member = {
                conversation_id: conversationId,
                user_id: userId,
                role,
                joined_at: new Date().toISOString()
            };
            currentData.conversationMembers.push(member);
            this.setData(currentData);
            if (this.DEBUG_COMMUNITY) {
                console.log('[COMMUNITY][LocalDB] addConversationMember', {
                    conversationId,
                    userId,
                    role
                });
            }
        }
    }
    async removeConversationMember(conversationId, userId) {
        const currentData = this.getData();
        currentData.conversationMembers = currentData.conversationMembers.filter((cm)=>!(cm.conversation_id === conversationId && cm.user_id === userId));
        this.setData(currentData);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] removeConversationMember', {
                conversationId,
                userId
            });
        }
    }
    async updateConversation(conversationId, data) {
        const currentData = this.getData();
        const index = currentData.conversations.findIndex((c)=>c.id === conversationId);
        if (index !== -1) {
            currentData.conversations[index] = {
                ...currentData.conversations[index],
                ...data,
                updated_at: new Date().toISOString()
            };
            this.setData(currentData);
            if (this.DEBUG_COMMUNITY) {
                console.log('[COMMUNITY][LocalDB] updateConversation', {
                    conversationId,
                    data
                });
            }
        }
    }
    // Messages
    async createMessage(message) {
        const currentData = this.getData();
        const newMessage = {
            ...message,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
        };
        currentData.messages.push(newMessage);
        this.setData(currentData);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] createMessage', {
                conversationId: message.conversation_id,
                senderId: message.sender_id,
                messageId: newMessage.id
            });
        }
        return newMessage;
    }
    async getMessages(conversationId, offset = 0, limit = 50) {
        const data = this.getData();
        const messages = data.messages.filter((m)=>m.conversation_id === conversationId && !m.deleted_at).sort((a, b)=>new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).slice(offset, offset + limit);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] getMessages', {
                conversationId,
                offset,
                limit,
                count: messages.length
            });
        }
        return messages;
    }
    async updateMessage(messageId, body) {
        const currentData = this.getData();
        const index = currentData.messages.findIndex((m)=>m.id === messageId);
        if (index !== -1) {
            currentData.messages[index].body = body;
            currentData.messages[index].edited_at = new Date().toISOString();
            this.setData(currentData);
            if (this.DEBUG_COMMUNITY) {
                console.log('[COMMUNITY][LocalDB] updateMessage', {
                    messageId,
                    body
                });
            }
            return currentData.messages[index];
        }
        throw new Error('Message not found');
    }
    async deleteMessage(messageId) {
        const currentData = this.getData();
        const index = currentData.messages.findIndex((m)=>m.id === messageId);
        if (index !== -1) {
            currentData.messages[index].deleted_at = new Date().toISOString();
            this.setData(currentData);
            if (this.DEBUG_COMMUNITY) {
                console.log('[COMMUNITY][LocalDB] deleteMessage', {
                    messageId
                });
            }
        }
    }
    // Blocks
    async blockUser(blockerId, blockedId) {
        const currentData = this.getData();
        const existingBlock = currentData.blocks.find((b)=>b.blocker_id === blockerId && b.blocked_id === blockedId);
        if (!existingBlock) {
            const block = {
                blocker_id: blockerId,
                blocked_id: blockedId,
                created_at: new Date().toISOString()
            };
            currentData.blocks.push(block);
            this.setData(currentData);
            if (this.DEBUG_COMMUNITY) {
                console.log('[COMMUNITY][LocalDB] blockUser', {
                    blockerId,
                    blockedId
                });
            }
        }
    }
    async unblockUser(blockerId, blockedId) {
        const currentData = this.getData();
        currentData.blocks = currentData.blocks.filter((b)=>!(b.blocker_id === blockerId && b.blocked_id === blockedId));
        this.setData(currentData);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] unblockUser', {
                blockerId,
                blockedId
            });
        }
    }
    async isBlocked(blockerId, blockedId) {
        const data = this.getData();
        const isBlocked = data.blocks.some((b)=>b.blocker_id === blockerId && b.blocked_id === blockedId);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] isBlocked', {
                blockerId,
                blockedId,
                isBlocked
            });
        }
        return isBlocked;
    }
    // Reports
    async reportUser(reporterId, reportedUserId, reason) {
        const currentData = this.getData();
        const newReport = {
            id: crypto.randomUUID(),
            reporter_id: reporterId,
            reported_user_id: reportedUserId,
            reason,
            created_at: new Date().toISOString()
        };
        currentData.reports.push(newReport);
        this.setData(currentData);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] reportUser', {
                reporterId,
                reportedUserId,
                reason
            });
        }
        return newReport;
    }
    async reportMessage(reporterId, messageId, reason) {
        const currentData = this.getData();
        const newReport = {
            id: crypto.randomUUID(),
            reporter_id: reporterId,
            message_id: messageId,
            reason,
            created_at: new Date().toISOString()
        };
        currentData.reports.push(newReport);
        this.setData(currentData);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] reportMessage', {
                reporterId,
                messageId,
                reason
            });
        }
        return newReport;
    }
    // Typing Indicators
    setTypingStatus(conversationId, userId, isTyping) {
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] setTypingStatus', {
                conversationId,
                userId,
                isTyping
            });
        }
        const data = this.getData();
        const now = Date.now();
        const conversationTyping = data.typingIndicators[conversationId] || [];
        if (isTyping) {
            // Add user to typing list
            const existingIndex = conversationTyping.findIndex((t)=>t.userId === userId);
            if (existingIndex >= 0) {
                conversationTyping[existingIndex].timestamp = now;
            } else {
                conversationTyping.push({
                    userId,
                    timestamp: now
                });
            }
        } else {
            // Remove user from typing list
            const existingIndex = conversationTyping.findIndex((t)=>t.userId === userId);
            if (existingIndex >= 0) {
                conversationTyping.splice(existingIndex, 1);
            }
        }
        data.typingIndicators[conversationId] = conversationTyping;
        this.setData(data);
    }
    async getTypingUsers(conversationId) {
        const data = this.getData();
        const now = Date.now();
        const fiveSecondsAgo = now - 5000; // Clear typing indicators older than 5 seconds
        const conversationTyping = data.typingIndicators[conversationId] || [];
        const recentTyping = conversationTyping.filter((t)=>t.timestamp > fiveSecondsAgo);
        // Update the typing indicators to remove stale entries
        data.typingIndicators[conversationId] = recentTyping;
        this.setData(data);
        const userIds = recentTyping.map((t)=>t.userId);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] getTypingUsers', {
                conversationId,
                userIds
            });
        }
        return userIds;
    }
    // Read Receipts
    async markAsRead(conversationId, userId, lastReadAt) {
        const currentData = this.getData();
        const memberIndex = currentData.conversationMembers.findIndex((cm)=>cm.conversation_id === conversationId && cm.user_id === userId);
        if (memberIndex !== -1) {
            currentData.conversationMembers[memberIndex].last_read_at = lastReadAt;
            this.setData(currentData);
            if (this.DEBUG_COMMUNITY) {
                console.log('[COMMUNITY][LocalDB] markAsRead', {
                    conversationId,
                    userId,
                    lastReadAt
                });
            }
        }
    }
    async getUnreadCount(conversationId, userId) {
        const data = this.getData();
        const member = data.conversationMembers.find((cm)=>cm.conversation_id === conversationId && cm.user_id === userId);
        const lastReadAt = member?.last_read_at ? new Date(member.last_read_at) : new Date(0);
        const unreadCount = data.messages.filter((m)=>m.conversation_id === conversationId && new Date(m.created_at) > lastReadAt && m.sender_id !== userId // Don't count own messages as unread
        ).length;
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][LocalDB] getUnreadCount', {
                conversationId,
                userId,
                unreadCount
            });
        }
        return unreadCount;
    }
}
}),
"[project]/src/community/db/SupabaseDB.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SupabaseDB",
    ()=>SupabaseDB
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
;
class SupabaseDB {
    supabase;
    DEBUG_COMMUNITY = process.env.DEBUG_COMMUNITY === 'true';
    constructor(){
        const supabaseUrl = ("TURBOPACK compile-time value", "https://toorbxzuursbcykjujhh.supabase.co");
        const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvb3JieHp1dXJzYmN5a2p1amhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTI0NDQsImV4cCI6MjA4MzI2ODQ0NH0.ciBMNKhEpYDQP1g-JjlP_1amlDPccc4YJbJ4LNiOwX8");
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        this.supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
    }
    // Profiles
    async getProfile(userId) {
        const { data, error } = await this.supabase.from('profiles').select('*').eq('id', userId).single();
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] getProfile error', error);
            }
            return null;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] getProfile', {
                userId,
                profile: data ? 'found' : 'not found'
            });
        }
        return data;
    }
    async updateProfile(userId, data) {
        const { data: updatedData, error } = await this.supabase.from('profiles').update({
            ...data,
            last_seen_at: new Date().toISOString()
        }).eq('id', userId).select().single();
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] updateProfile error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] updateProfile', {
                userId,
                data
            });
        }
        return updatedData;
    }
    async searchProfiles(query) {
        const { data, error } = await this.supabase.from('profiles').select('*').or(`username.ilike.%${query}%,display_name.ilike.%${query}%`);
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] searchProfiles error', error);
            }
            return [];
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] searchProfiles', {
                query,
                results: data?.length || 0
            });
        }
        return data;
    }
    // Friend Requests
    async createFriendRequest(requesterId, addresseeId) {
        const newRequest = {
            id: crypto.randomUUID(),
            requester_id: requesterId,
            addressee_id: addresseeId,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        const { data, error } = await this.supabase.from('friend_requests').insert([
            newRequest
        ]).select().single();
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] createFriendRequest error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] createFriendRequest', {
                requesterId,
                addresseeId,
                requestId: data.id
            });
        }
        return data;
    }
    async updateFriendRequest(requestId, status) {
        const { data, error } = await this.supabase.from('friend_requests').update({
            status,
            updated_at: new Date().toISOString()
        }).eq('id', requestId).select().single();
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] updateFriendRequest error', error);
            }
            throw error;
        }
        // If accepted, create friendship entries
        if (status === 'accepted' && data) {
            const request = data;
            const friendEntry1 = {
                user_id: request.requester_id,
                friend_id: request.addressee_id,
                created_at: new Date().toISOString()
            };
            const friendEntry2 = {
                user_id: request.addressee_id,
                friend_id: request.requester_id,
                created_at: new Date().toISOString()
            };
            await this.supabase.from('friends').insert([
                friendEntry1,
                friendEntry2
            ]);
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] updateFriendRequest', {
                requestId,
                status
            });
        }
        return data;
    }
    async getFriendRequests(userId) {
        const { data, error } = await this.supabase.from('friend_requests').select('*').or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] getFriendRequests error', error);
            }
            return [];
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] getFriendRequests', {
                userId,
                count: data?.length || 0
            });
        }
        return data;
    }
    // Friends
    async getFriends(userId) {
        const { data, error } = await this.supabase.from('friends').select('*').eq('user_id', userId);
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] getFriends error', error);
            }
            return [];
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] getFriends', {
                userId,
                count: data?.length || 0
            });
        }
        return data;
    }
    async unfriend(userId, friendId) {
        await this.supabase.from('friends').delete().or(`(user_id.eq.${userId},friend_id.eq.${friendId}),(user_id.eq.${friendId},friend_id.eq.${userId})`);
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] unfriend', {
                userId,
                friendId
            });
        }
    }
    // Conversations
    async createConversation(isGroup, createdBy, title, userIds) {
        const newConversation = {
            id: crypto.randomUUID(),
            is_group: isGroup,
            title: title || (isGroup ? 'Group Chat' : undefined),
            created_by: createdBy,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        const { data, error } = await this.supabase.from('conversations').insert([
            newConversation
        ]).select().single();
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] createConversation error', error);
            }
            throw error;
        }
        // Add creator as member
        await this.supabase.from('conversation_members').insert([
            {
                conversation_id: data.id,
                user_id: createdBy,
                role: 'owner',
                joined_at: new Date().toISOString()
            }
        ]);
        // Add other users if provided
        if (userIds) {
            for (const userId of userIds){
                if (userId !== createdBy) {
                    await this.supabase.from('conversation_members').insert([
                        {
                            conversation_id: data.id,
                            user_id: userId,
                            role: 'member',
                            joined_at: new Date().toISOString()
                        }
                    ]);
                }
            }
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] createConversation', {
                isGroup,
                createdBy,
                title,
                userIds,
                conversationId: data.id
            });
        }
        return data;
    }
    async getConversations(userId) {
        const { data, error } = await this.supabase.from('conversation_members').select('conversation_id').eq('user_id', userId);
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] getConversations error', error);
            }
            return [];
        }
        const conversationIds = data.map((cm)=>cm.conversation_id);
        const { data: conversations, error: convError } = await this.supabase.from('conversations').select('*').in('id', conversationIds);
        if (convError) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] getConversations error fetching conversations', convError);
            }
            return [];
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] getConversations', {
                userId,
                count: conversations?.length || 0
            });
        }
        return conversations;
    }
    async getConversation(conversationId) {
        const { data, error } = await this.supabase.from('conversations').select('*').eq('id', conversationId).single();
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] getConversation error', error);
            }
            return null;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] getConversation', {
                conversationId,
                found: !!data
            });
        }
        return data;
    }
    async addConversationMember(conversationId, userId, role = 'member') {
        const { error } = await this.supabase.from('conversation_members').insert([
            {
                conversation_id: conversationId,
                user_id: userId,
                role,
                joined_at: new Date().toISOString()
            }
        ]);
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] addConversationMember error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] addConversationMember', {
                conversationId,
                userId,
                role
            });
        }
    }
    async removeConversationMember(conversationId, userId) {
        const { error } = await this.supabase.from('conversation_members').delete().match({
            conversation_id: conversationId,
            user_id: userId
        });
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] removeConversationMember error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] removeConversationMember', {
                conversationId,
                userId
            });
        }
    }
    async updateConversation(conversationId, data) {
        const { error } = await this.supabase.from('conversations').update({
            ...data,
            updated_at: new Date().toISOString()
        }).eq('id', conversationId);
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] updateConversation error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] updateConversation', {
                conversationId,
                data
            });
        }
    }
    // Messages
    async createMessage(message) {
        const newMessage = {
            ...message,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
        };
        const { data, error } = await this.supabase.from('messages').insert([
            newMessage
        ]).select().single();
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] createMessage error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] createMessage', {
                conversationId: message.conversation_id,
                senderId: message.sender_id,
                messageId: data.id
            });
        }
        return data;
    }
    async getMessages(conversationId, offset = 0, limit = 50) {
        const { data, error } = await this.supabase.from('messages').select('*').eq('conversation_id', conversationId).is('deleted_at', null).order('created_at', {
            ascending: true
        }).range(offset, offset + limit - 1);
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] getMessages error', error);
            }
            return [];
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] getMessages', {
                conversationId,
                offset,
                limit,
                count: data?.length || 0
            });
        }
        return data;
    }
    async updateMessage(messageId, body) {
        const { data, error } = await this.supabase.from('messages').update({
            body,
            edited_at: new Date().toISOString()
        }).eq('id', messageId).select().single();
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] updateMessage error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] updateMessage', {
                messageId,
                body
            });
        }
        return data;
    }
    async deleteMessage(messageId) {
        const { error } = await this.supabase.from('messages').update({
            deleted_at: new Date().toISOString()
        }).eq('id', messageId);
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] deleteMessage error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] deleteMessage', {
                messageId
            });
        }
    }
    // Blocks
    async blockUser(blockerId, blockedId) {
        const block = {
            blocker_id: blockerId,
            blocked_id: blockedId,
            created_at: new Date().toISOString()
        };
        const { error } = await this.supabase.from('blocks').insert([
            block
        ]);
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] blockUser error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] blockUser', {
                blockerId,
                blockedId
            });
        }
    }
    async unblockUser(blockerId, blockedId) {
        const { error } = await this.supabase.from('blocks').delete().match({
            blocker_id: blockerId,
            blocked_id: blockedId
        });
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] unblockUser error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] unblockUser', {
                blockerId,
                blockedId
            });
        }
    }
    async isBlocked(blockerId, blockedId) {
        const { data, error } = await this.supabase.from('blocks').select('id').match({
            blocker_id: blockerId,
            blocked_id: blockedId
        }).single();
        if (error && error.code !== 'PGRST116') {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] isBlocked error', error);
            }
            return false;
        }
        const isBlocked = !!data;
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] isBlocked', {
                blockerId,
                blockedId,
                isBlocked
            });
        }
        return isBlocked;
    }
    // Reports
    async reportUser(reporterId, reportedUserId, reason) {
        const newReport = {
            id: crypto.randomUUID(),
            reporter_id: reporterId,
            reported_user_id: reportedUserId,
            reason,
            created_at: new Date().toISOString()
        };
        const { data, error } = await this.supabase.from('reports').insert([
            newReport
        ]).select().single();
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] reportUser error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] reportUser', {
                reporterId,
                reportedUserId,
                reason
            });
        }
        return data;
    }
    async reportMessage(reporterId, messageId, reason) {
        const newReport = {
            id: crypto.randomUUID(),
            reporter_id: reporterId,
            message_id: messageId,
            reason,
            created_at: new Date().toISOString()
        };
        const { data, error } = await this.supabase.from('reports').insert([
            newReport
        ]).select().single();
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] reportMessage error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] reportMessage', {
                reporterId,
                messageId,
                reason
            });
        }
        return data;
    }
    // Typing Indicators (ephemeral, not stored long term)
    setTypingStatus(conversationId, userId, isTyping) {
        // In Supabase mode, we'll use Supabase Realtime for typing indicators
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] setTypingStatus', {
                conversationId,
                userId,
                isTyping
            });
        }
    }
    async getTypingUsers(conversationId) {
        // In Supabase mode, typing indicators would be handled via Realtime subscriptions
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] getTypingUsers', {
                conversationId
            });
        }
        return [];
    }
    // Read Receipts
    async markAsRead(conversationId, userId, lastReadAt) {
        const { error } = await this.supabase.from('conversation_members').update({
            last_read_at: lastReadAt
        }).match({
            conversation_id: conversationId,
            user_id: userId
        });
        if (error) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] markAsRead error', error);
            }
            throw error;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] markAsRead', {
                conversationId,
                userId,
                lastReadAt
            });
        }
    }
    async getUnreadCount(conversationId, userId) {
        // Get the last read time for this user in this conversation
        const { data: member, error: memberError } = await this.supabase.from('conversation_members').select('last_read_at').match({
            conversation_id: conversationId,
            user_id: userId
        }).single();
        if (memberError) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] getUnreadCount error getting member', memberError);
            }
            return 0;
        }
        const lastReadAt = member?.last_read_at ? new Date(member.last_read_at) : new Date(0);
        // Count messages sent after last read time by other users
        const { count, error: countError } = await this.supabase.from('messages').select('*', {
            count: 'exact',
            head: true
        }).eq('conversation_id', conversationId).gt('created_at', lastReadAt.toISOString()).neq('sender_id', userId) // Don't count own messages as unread
        .is('deleted_at', null);
        if (countError) {
            if (this.DEBUG_COMMUNITY) {
                console.error('[COMMUNITY][SupabaseDB] getUnreadCount error getting count', countError);
            }
            return 0;
        }
        if (this.DEBUG_COMMUNITY) {
            console.log('[COMMUNITY][SupabaseDB] getUnreadCount', {
                conversationId,
                userId,
                unreadCount: count
            });
        }
        return count || 0;
    }
}
}),
"[project]/src/community/db/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCommunityDB",
    ()=>getCommunityDB
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$community$2f$db$2f$LocalDB$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/community/db/LocalDB.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$community$2f$db$2f$SupabaseDB$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/community/db/SupabaseDB.ts [app-ssr] (ecmascript)");
;
;
;
let dbInstance = null;
const getCommunityDB = async ()=>{
    if (dbInstance) {
        return dbInstance;
    }
    const DEBUG_COMMUNITY = process.env.DEBUG_COMMUNITY === 'true';
    // Check if Supabase is available
    const supabaseUrl = ("TURBOPACK compile-time value", "https://toorbxzuursbcykjujhh.supabase.co");
    if ("TURBOPACK compile-time truthy", 1) {
        try {
            const response = await fetch(`${supabaseUrl}/auth/v1/health`);
            if (response.ok) {
                if (DEBUG_COMMUNITY) {
                    console.log('[COMMUNITY] Using SupabaseDB backend');
                }
                dbInstance = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$community$2f$db$2f$SupabaseDB$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SupabaseDB"]();
                return dbInstance;
            }
        } catch (error) {
            if (DEBUG_COMMUNITY) {
                console.log('[COMMUNITY] Supabase not reachable, using LocalDB backend');
            }
        }
    }
    if (DEBUG_COMMUNITY) {
        console.log('[COMMUNITY] Using LocalDB backend');
    }
    dbInstance = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$community$2f$db$2f$LocalDB$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LocalDB"]();
    return dbInstance;
};
}),
"[project]/src/app/community/debug/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$community$2f$db$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/community/db/index.ts [app-ssr] (ecmascript) <locals>");
'use client';
;
;
;
;
const CommunityDebugPage = ()=>{
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const user = state.user;
    const [debugInfo, setDebugInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const getDebugInfo = async ()=>{
            try {
                const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$community$2f$db$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCommunityDB"])();
                // Get basic debug info
                const info = {
                    dbMode: db.constructor.name,
                    currentUserId: user?.id || null,
                    timestamp: new Date().toISOString(),
                    envVars: {
                        supabaseUrl: ("TURBOPACK compile-time truthy", 1) ? 'SET' : "TURBOPACK unreachable",
                        debugCommunity: process.env.DEBUG_COMMUNITY
                    }
                };
                // If it's a local DB, get additional stats
                if (db.constructor.name === 'LocalDB') {
                    // Note: This is just mock data since we can't access the private fields directly
                    info.localStats = {
                        profilesCount: 'N/A - Internal access',
                        conversationsCount: 'N/A - Internal access',
                        messagesCount: 'N/A - Internal access'
                    };
                }
                setDebugInfo(info);
                setLoading(false);
            } catch (err) {
                console.error('[COMMUNITY][DEBUG] Error getting debug info:', err);
                setError('Failed to get debug info: ' + err.message);
                setLoading(false);
            }
        };
        if (user) {
            getDebugInfo();
        }
    }, [
        user
    ]);
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gray-900 text-white p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-4xl mx-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold mb-8 text-accent-primary",
                        children: "Community Debug"
                    }, void 0, false, {
                        fileName: "[project]/src/app/community/debug/page.tsx",
                        lineNumber: 69,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-pulse",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-8 bg-gray-700 rounded w-1/4 mb-6"
                            }, void 0, false, {
                                fileName: "[project]/src/app/community/debug/page.tsx",
                                lineNumber: 71,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 bg-gray-700 rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/community/debug/page.tsx",
                                        lineNumber: 73,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 bg-gray-700 rounded w-5/6"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/community/debug/page.tsx",
                                        lineNumber: 74,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 bg-gray-700 rounded w-4/6"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/community/debug/page.tsx",
                                        lineNumber: 75,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/community/debug/page.tsx",
                                lineNumber: 72,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/community/debug/page.tsx",
                        lineNumber: 70,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/community/debug/page.tsx",
                lineNumber: 68,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/app/community/debug/page.tsx",
            lineNumber: 67,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gray-900 text-white p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-4xl mx-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold mb-8 text-accent-primary",
                        children: "Community Debug"
                    }, void 0, false, {
                        fileName: "[project]/src/app/community/debug/page.tsx",
                        lineNumber: 87,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/community/debug/page.tsx",
                        lineNumber: 88,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/community/debug/page.tsx",
                lineNumber: 86,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/app/community/debug/page.tsx",
            lineNumber: 85,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-900 text-white p-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-4xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-3xl font-bold mb-8 text-accent-primary",
                    children: "Community Debug"
                }, void 0, false, {
                    fileName: "[project]/src/app/community/debug/page.tsx",
                    lineNumber: 99,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-800/50 rounded-lg p-6 border border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl font-semibold mb-4 text-accent-primary",
                                    children: "System Info"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                    lineNumber: 103,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-medium text-gray-400",
                                                    children: "Database Mode"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 106,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white",
                                                    children: debugInfo?.dbMode
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 107,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/community/debug/page.tsx",
                                            lineNumber: 105,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-medium text-gray-400",
                                                    children: "Current User ID"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 110,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white",
                                                    children: debugInfo?.currentUserId || 'None'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 111,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/community/debug/page.tsx",
                                            lineNumber: 109,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-medium text-gray-400",
                                                    children: "Timestamp"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 114,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white",
                                                    children: debugInfo?.timestamp
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 115,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/community/debug/page.tsx",
                                            lineNumber: 113,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-medium text-gray-400",
                                                    children: "Debug Enabled"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 118,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white",
                                                    children: debugInfo?.envVars.debugCommunity || 'false'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 119,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/community/debug/page.tsx",
                                            lineNumber: 117,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/community/debug/page.tsx",
                            lineNumber: 102,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-800/50 rounded-lg p-6 border border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl font-semibold mb-4 text-accent-primary",
                                    children: "Environment Variables"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                    lineNumber: 125,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-gray-400",
                                                    children: "NEXT_PUBLIC_SUPABASE_URL"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 128,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-white",
                                                    children: debugInfo?.envVars.supabaseUrl
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 129,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/community/debug/page.tsx",
                                            lineNumber: 127,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-gray-400",
                                                    children: "DEBUG_COMMUNITY"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 132,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-white",
                                                    children: debugInfo?.envVars.debugCommunity || 'false'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 133,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/community/debug/page.tsx",
                                            lineNumber: 131,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/community/debug/page.tsx",
                            lineNumber: 124,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        debugInfo?.localStats && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-800/50 rounded-lg p-6 border border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl font-semibold mb-4 text-accent-primary",
                                    children: "Local DB Stats"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                    lineNumber: 140,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-medium text-gray-400",
                                                    children: "Profiles"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 143,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white",
                                                    children: debugInfo.localStats.profilesCount
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 144,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/community/debug/page.tsx",
                                            lineNumber: 142,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-medium text-gray-400",
                                                    children: "Conversations"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 147,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white",
                                                    children: debugInfo.localStats.conversationsCount
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 148,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/community/debug/page.tsx",
                                            lineNumber: 146,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-medium text-gray-400",
                                                    children: "Messages"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 151,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white",
                                                    children: debugInfo.localStats.messagesCount
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                                    lineNumber: 152,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/community/debug/page.tsx",
                                            lineNumber: 150,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                    lineNumber: 141,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/community/debug/page.tsx",
                            lineNumber: 139,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-800/50 rounded-lg p-6 border border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl font-semibold mb-4 text-accent-primary",
                                    children: "Actions"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                    lineNumber: 159,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>window.location.reload(),
                                            className: "px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 border border-accent-primary",
                                            children: "Refresh Debug Info"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/community/debug/page.tsx",
                                            lineNumber: 161,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>console.log('[COMMUNITY] Manual debug log'),
                                            className: "px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600",
                                            children: "Trigger Debug Log"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/community/debug/page.tsx",
                                            lineNumber: 167,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/community/debug/page.tsx",
                                    lineNumber: 160,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/community/debug/page.tsx",
                            lineNumber: 158,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/community/debug/page.tsx",
                    lineNumber: 101,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/community/debug/page.tsx",
            lineNumber: 98,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/app/community/debug/page.tsx",
        lineNumber: 97,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = CommunityDebugPage;
}),
];

//# sourceMappingURL=src_7ae46184._.js.map