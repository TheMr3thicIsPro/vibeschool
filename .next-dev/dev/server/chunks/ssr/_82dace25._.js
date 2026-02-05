module.exports = [
"[project]/src/lib/youtubeParser.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Parse YouTube URL or ID to extract video ID and create embed URL
 * @param input - Raw YouTube URL or video ID
 * @returns Object containing videoId, embedUrl, and optional error
 */ __turbopack_context__.s([
    "parseYouTube",
    ()=>parseYouTube
]);
function parseYouTube(input) {
    if (!input || typeof input !== 'string') {
        return {
            videoId: null,
            embedUrl: null,
            error: 'Input is required and must be a string'
        };
    }
    // Clean the input by trimming whitespace
    const cleanedInput = input.trim();
    // Regular expression to validate YouTube video ID format (11 alphanumeric chars including hyphens and underscores)
    const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    // If input is exactly 11 characters and matches YouTube ID format, treat as raw ID
    if (cleanedInput.length === 11 && videoIdRegex.test(cleanedInput)) {
        return {
            videoId: cleanedInput,
            embedUrl: `https://www.youtube.com/embed/${cleanedInput}`,
            error: undefined
        };
    }
    // Regular expression to match various YouTube URL formats
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = cleanedInput.match(youtubeRegex);
    if (match && match[1]) {
        const videoId = match[1];
        return {
            videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            error: undefined
        };
    }
    // Check for YouTube Shorts format
    const shortsRegex = /youtube\.com\/shorts\/([^"&?\/\s]{11})/i;
    const shortsMatch = cleanedInput.match(shortsRegex);
    if (shortsMatch && shortsMatch[1]) {
        const videoId = shortsMatch[1];
        return {
            videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            error: undefined
        };
    }
    // If no match found, return error
    return {
        videoId: null,
        embedUrl: null,
        error: 'Invalid YouTube URL or video ID. Please provide a valid YouTube URL or 11-character video ID.'
    };
}
}),
"[project]/src/actions/courseActions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00c729f0fcb13a9acca85acc69472af5affee8caf1":"listCourses","400a05ef8d432a3c4ed68bbb7dc7ea3e67e5767d27":"deleteLesson","404001c0ab7c8ec1296d7f0e74492b7cb2781bc127":"listLessons","409d1156001915a04f18aaeda7086d1c6ae3b5eb26":"listModules","40cada5192e4898fc97c2bec447f5f0c82920adcbf":"deleteCourse","40d3794158f33f10553408babb4643c61f0a01e583":"deleteModule","6046af6abcb651fccb3745a478842f8fb570eb939f":"updateModule","605841422bbcd60441154894f36579b80e85d9fcc3":"publishCourse","609d5750ce9eb702195e2c54ba908d22b9c64a6264":"updateLesson","60a56318eb6059efc1f0fdfdb4070a7fdc94305b9b":"reorderLessons","60b20a256cfaf7dc44fb26ead925cb0f33e7c114b3":"createCourse","60b29e0ba500eff3491b52b333dbe1f0c36ba96db4":"updateCourse","60c099a26d59c66b0d55e0af188374b1d738722fe8":"createModule","60dfb916d99351656b3d40dd5fd4b0b67f331b7ba1":"reorderModules","7842ffb104e6a18f93868d6ff8498037ad7d65c330":"createLesson"},"",""] */ __turbopack_context__.s([
    "createCourse",
    ()=>createCourse,
    "createLesson",
    ()=>createLesson,
    "createModule",
    ()=>createModule,
    "deleteCourse",
    ()=>deleteCourse,
    "deleteLesson",
    ()=>deleteLesson,
    "deleteModule",
    ()=>deleteModule,
    "listCourses",
    ()=>listCourses,
    "listLessons",
    ()=>listLessons,
    "listModules",
    ()=>listModules,
    "publishCourse",
    ()=>publishCourse,
    "reorderLessons",
    ()=>reorderLessons,
    "reorderModules",
    ()=>reorderModules,
    "updateCourse",
    ()=>updateCourse,
    "updateLesson",
    ()=>updateLesson,
    "updateModule",
    ()=>updateModule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$youtubeParser$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/youtubeParser.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
// Helper function to create Supabase client for server actions
async function createSupabaseClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://toorbxzuursbcykjujhh.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvb3JieHp1dXJzYmN5a2p1amhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTI0NDQsImV4cCI6MjA4MzI2ODQ0NH0.ciBMNKhEpYDQP1g-JjlP_1amlDPccc4YJbJ4LNiOwX8"), {
        cookies: {
            get: (name)=>{
                const cookie = cookieStore.get(name);
                return cookie ? cookie.value : undefined;
            }
        }
    });
}
// Check if user is admin
async function isAdmin(supabase) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return false;
    }
    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profileError || !profile) {
        return false;
    }
    return profile.role === 'admin' || profile.role === 'teacher';
}
async function listCourses() {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            console.log('DEBUG: listCourses - Access denied, not admin/teacher');
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        console.log('DEBUG: listCourses - Fetching all courses for admin');
        const { data, error } = await supabase.from('courses').select('*').order('created_at', {
            ascending: false
        });
        console.log('DEBUG: listCourses - Query result:', {
            data: data?.length,
            error
        });
        if (error) {
            console.error('DEBUG: listCourses - Supabase error:', error);
            return {
                data: null,
                error: error.message
            };
        }
        console.log('DEBUG: listCourses - Returning courses:', data?.length);
        return {
            data,
            error: null
        };
    } catch (error) {
        console.error('DEBUG: listCourses - Exception:', error);
        return {
            data: null,
            error: error.message
        };
    }
}
async function createCourse(title, description) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            console.log('DEBUG: createCourse - Access denied, not admin/teacher');
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        console.log('DEBUG: createCourse - Creating course:', {
            title,
            description
        });
        const { data, error } = await supabase.from('courses').insert([
            {
                title,
                description
            }
        ]).select().single();
        console.log('DEBUG: createCourse - Insert result:', {
            data: !!data,
            error
        });
        if (error) {
            console.error('DEBUG: createCourse - Supabase error:', error);
            return {
                data: null,
                error: error.message
            };
        }
        // Revalidate the cache to ensure frontend reflects changes
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/courses');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        console.log('DEBUG: createCourse - Course created successfully, cache invalidated');
        return {
            data,
            error: null
        };
    } catch (error) {
        console.error('DEBUG: createCourse - Exception:', error);
        return {
            data: null,
            error: error.message
        };
    }
}
async function updateCourse(id, updates) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single();
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        // Revalidate the cache to ensure frontend reflects changes
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/courses');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
async function deleteCourse(id) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) {
            return {
                error: error.message
            };
        }
        // Revalidate the cache to ensure frontend reflects changes
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/courses');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        return {
            error: null
        };
    } catch (error) {
        return {
            error: error.message
        };
    }
}
async function publishCourse(id, isPublished) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        const { data, error } = await supabase.from('courses').update({
            is_published: isPublished
        }).eq('id', id).select().single();
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        // Revalidate the cache to ensure frontend reflects changes
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/courses');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
async function listModules(courseId) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        const { data, error } = await supabase.from('modules').select('*').eq('course_id', courseId).order('order_index', {
            ascending: true
        });
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
async function createModule(courseId, title) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        // Get the highest order_index to determine the new position
        const { data: existingModules } = await supabase.from('modules').select('order_index').eq('course_id', courseId).order('order_index', {
            ascending: false
        }).limit(1);
        const newOrderIndex = existingModules && existingModules.length > 0 ? existingModules[0].order_index + 10 : 0;
        const { data, error } = await supabase.from('modules').insert([
            {
                course_id: courseId,
                title,
                order_index: newOrderIndex
            }
        ]).select().single();
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        // Revalidate the cache to ensure frontend reflects changes
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/courses');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
async function updateModule(id, updates) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        const { data, error } = await supabase.from('modules').update(updates).eq('id', id).select().single();
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        // Revalidate the cache to ensure frontend reflects changes
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/courses');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
async function deleteModule(id) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        const { error } = await supabase.from('modules').delete().eq('id', id);
        if (error) {
            return {
                error: error.message
            };
        }
        // Revalidate the cache to ensure frontend reflects changes
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/courses');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        return {
            error: null
        };
    } catch (error) {
        return {
            error: error.message
        };
    }
}
async function reorderModules(courseId, moduleIds) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        // Update all modules with their new positions in a single transaction
        const updates = moduleIds.map((id, index)=>({
                id,
                order_index: index * 10 // Use increments of 10 to allow for future insertions between items
            }));
        // Perform updates in a batch
        for (const update of updates){
            const { error } = await supabase.from('modules').update({
                order_index: update.order_index
            }).eq('id', update.id).eq('course_id', courseId); // Additional safety check
            if (error) {
                return {
                    error: error.message
                };
            }
        }
        // Revalidate the cache to ensure frontend reflects changes
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/courses');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        return {
            error: null
        };
    } catch (error) {
        return {
            error: error.message
        };
    }
}
async function listLessons(moduleId) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        const { data, error } = await supabase.from('lessons').select('*').eq('module_id', moduleId).order('order_index', {
            ascending: true
        });
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
async function createLesson(moduleId, title, description, youtubeUrl) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        // Parse the YouTube URL
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$youtubeParser$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseYouTube"])(youtubeUrl);
        if (parsed.error) {
            return {
                data: null,
                error: parsed.error
            };
        }
        // Get the highest order_index to determine the new position
        const { data: existingLessons } = await supabase.from('lessons').select('order_index').eq('module_id', moduleId).order('order_index', {
            ascending: false
        }).limit(1);
        const newOrderIndex = existingLessons && existingLessons.length > 0 ? existingLessons[0].order_index + 10 : 0;
        const { data, error } = await supabase.from('lessons').insert([
            {
                module_id: moduleId,
                title,
                description,
                youtube_video_id: parsed.videoId,
                video_url: parsed.embedUrl,
                order_index: newOrderIndex,
                is_preview: false,
                is_published: true
            }
        ]).select().single();
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        // Revalidate the cache to ensure frontend reflects changes
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/courses');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
async function updateLesson(id, updates) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        // If updating YouTube URL, parse it first
        if (updates.video_url) {
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$youtubeParser$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseYouTube"])(updates.video_url);
            if (parsed.error) {
                return {
                    data: null,
                    error: parsed.error
                };
            }
            updates.youtube_video_id = parsed.videoId;
            updates.video_url = parsed.embedUrl;
        }
        const { data, error } = await supabase.from('lessons').update(updates).eq('id', id).select().single();
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        // Revalidate the cache to ensure frontend reflects changes
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/courses');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
async function deleteLesson(id) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) {
            return {
                error: error.message
            };
        }
        // Revalidate the cache to ensure frontend reflects changes
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/courses');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        return {
            error: null
        };
    } catch (error) {
        return {
            error: error.message
        };
    }
}
async function reorderLessons(moduleId, lessonIds) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        // Update all lessons with their new positions in a single transaction
        const updates = lessonIds.map((id, index)=>({
                id,
                order_index: index * 10 // Use increments of 10 to allow for future insertions between items
            }));
        // Perform updates in a batch
        for (const update of updates){
            const { error } = await supabase.from('lessons').update({
                order_index: update.order_index
            }).eq('id', update.id).eq('module_id', moduleId); // Additional safety check
            if (error) {
                return {
                    error: error.message
                };
            }
        }
        // Revalidate the cache to ensure frontend reflects changes
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/courses');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        return {
            error: null
        };
    } catch (error) {
        return {
            error: error.message
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    listCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    listModules,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
    listLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(listCourses, "00c729f0fcb13a9acca85acc69472af5affee8caf1", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createCourse, "60b20a256cfaf7dc44fb26ead925cb0f33e7c114b3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateCourse, "60b29e0ba500eff3491b52b333dbe1f0c36ba96db4", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteCourse, "40cada5192e4898fc97c2bec447f5f0c82920adcbf", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(publishCourse, "605841422bbcd60441154894f36579b80e85d9fcc3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(listModules, "409d1156001915a04f18aaeda7086d1c6ae3b5eb26", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createModule, "60c099a26d59c66b0d55e0af188374b1d738722fe8", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateModule, "6046af6abcb651fccb3745a478842f8fb570eb939f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteModule, "40d3794158f33f10553408babb4643c61f0a01e583", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(reorderModules, "60dfb916d99351656b3d40dd5fd4b0b67f331b7ba1", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(listLessons, "404001c0ab7c8ec1296d7f0e74492b7cb2781bc127", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createLesson, "7842ffb104e6a18f93868d6ff8498037ad7d65c330", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateLesson, "609d5750ce9eb702195e2c54ba908d22b9c64a6264", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteLesson, "400a05ef8d432a3c4ed68bbb7dc7ea3e67e5767d27", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(reorderLessons, "60a56318eb6059efc1f0fdfdb4070a7fdc94305b9b", null);
}),
"[project]/src/actions/announcementActions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00721cff8990621339d8f211b753c247a8623d0334":"listAnnouncements","400492345bb78809c3046bc3a072b760be7d685af4":"deleteAnnouncement","601008e387c4ecce70c76b3fdf610fdd5505e25a3e":"updateAnnouncement","60193bb4f320ace54e465f7c3e29f92ce450ee210d":"createAnnouncement"},"",""] */ __turbopack_context__.s([
    "createAnnouncement",
    ()=>createAnnouncement,
    "deleteAnnouncement",
    ()=>deleteAnnouncement,
    "listAnnouncements",
    ()=>listAnnouncements,
    "updateAnnouncement",
    ()=>updateAnnouncement
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
// Helper function to create Supabase client for server actions
async function createSupabaseClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://toorbxzuursbcykjujhh.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvb3JieHp1dXJzYmN5a2p1amhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTI0NDQsImV4cCI6MjA4MzI2ODQ0NH0.ciBMNKhEpYDQP1g-JjlP_1amlDPccc4YJbJ4LNiOwX8"), {
        cookies: {
            get: (name)=>{
                const cookie = cookieStore.get(name);
                return cookie ? cookie.value : undefined;
            }
        }
    });
}
// Check if user is admin
async function isAdmin(supabase) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return false;
    }
    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profileError || !profile) {
        return false;
    }
    return profile.role === 'admin' || profile.role === 'teacher';
}
async function listAnnouncements() {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        const { data, error } = await supabase.from('announcements').select('*').order('created_at', {
            ascending: false
        });
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
async function createAnnouncement(title, body) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        const { data, error } = await supabase.from('announcements').insert([
            {
                title,
                body
            }
        ]).select().single();
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
async function updateAnnouncement(id, updates) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        const { data, error } = await supabase.from('announcements').update(updates).eq('id', id).select().single();
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
async function deleteAnnouncement(id) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                error: 'Access denied. Admin or teacher role required.'
            };
        }
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) {
            return {
                error: error.message
            };
        }
        return {
            error: null
        };
    } catch (error) {
        return {
            error: error.message
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    listAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(listAnnouncements, "00721cff8990621339d8f211b753c247a8623d0334", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createAnnouncement, "60193bb4f320ace54e465f7c3e29f92ce450ee210d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateAnnouncement, "601008e387c4ecce70c76b3fdf610fdd5505e25a3e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteAnnouncement, "400492345bb78809c3046bc3a072b760be7d685af4", null);
}),
"[project]/src/actions/userActions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00fe4727cac8f70f5edc703838dabca6792c690f8e":"listUsers","40b083290b2943a82c9a8c5f73798589e54bbc5ad3":"deleteUser","40f55f860f5f5c1e2bb377b18c1a0c1620c50320b7":"searchUsers","60b4ddf67d2006cf4a29da630db45e4a7a4beda1e4":"updateUser"},"",""] */ __turbopack_context__.s([
    "deleteUser",
    ()=>deleteUser,
    "listUsers",
    ()=>listUsers,
    "searchUsers",
    ()=>searchUsers,
    "updateUser",
    ()=>updateUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
// Helper function to create Supabase client for server actions
async function createSupabaseClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://toorbxzuursbcykjujhh.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvb3JieHp1dXJzYmN5a2p1amhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTI0NDQsImV4cCI6MjA4MzI2ODQ0NH0.ciBMNKhEpYDQP1g-JjlP_1amlDPccc4YJbJ4LNiOwX8"), {
        cookies: {
            get: (name)=>{
                const cookie = cookieStore.get(name);
                return cookie ? cookie.value : undefined;
            }
        }
    });
}
// Check if user is admin
async function isAdmin(supabase) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return false;
    }
    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profileError || !profile) {
        return false;
    }
    return profile.role === 'admin';
}
async function listUsers() {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin role required.'
            };
        }
        // Join with auth.users to get email
        const { data, error } = await supabase.from('profiles').select(`
        id,
        username,
        role,
        plan,
        created_at
      `).order('created_at', {
            ascending: false
        });
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        // For now, we'll return mock emails since we can't access auth.users directly from RLS
        // In a real implementation, you'd need a service role key or a dedicated RPC function
        const usersWithMockEmails = data.map((user)=>({
                ...user,
                email: `${user.username}@example.com` // Mock email for demo purposes
            }));
        return {
            data: usersWithMockEmails,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
async function updateUser(id, updates) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin role required.'
            };
        }
        // Use the hardened service function
        const { data, error } = await supabase.from('profiles').update({
            role: updates.role,
            plan: updates.plan
        }).eq('id', id).select().maybeSingle(); // Changed from .single() to .maybeSingle()
        if (error) {
            console.error('[USER ACTION] Update error:', error);
            return {
                data: null,
                error: error.message
            };
        }
        // Handle case where no rows were updated
        if (!data) {
            console.error('[USER ACTION] No profile found for update:', id);
            return {
                data: null,
                error: 'No profile found for this user'
            };
        }
        // Add mock email
        const userData = {
            ...data,
            email: `${data.username}@example.com`
        };
        return {
            data: userData,
            error: null
        };
    } catch (error) {
        console.error('[USER ACTION] Unexpected error:', error);
        return {
            data: null,
            error: error.message
        };
    }
}
async function deleteUser(id) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                error: 'Access denied. Admin role required.'
            };
        }
        // Note: In a real implementation, you'd want to properly delete the user
        // from auth.users as well, but that typically requires a service role key
        // For now, we'll just delete from profiles
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) {
            return {
                error: error.message
            };
        }
        return {
            error: null
        };
    } catch (error) {
        return {
            error: error.message
        };
    }
}
async function searchUsers(searchTerm) {
    const supabase = await createSupabaseClient();
    try {
        // Check admin access
        const adminCheck = await isAdmin(supabase);
        if (!adminCheck) {
            return {
                data: null,
                error: 'Access denied. Admin role required.'
            };
        }
        const { data, error } = await supabase.from('profiles').select(`
        id,
        username,
        role,
        plan,
        created_at
      `).or(`username.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`).order('created_at', {
            ascending: false
        });
        if (error) {
            return {
                data: null,
                error: error.message
            };
        }
        // Add mock emails
        const usersWithMockEmails = data.map((user)=>({
                ...user,
                email: `${user.username}@example.com`
            }));
        return {
            data: usersWithMockEmails,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.message
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    listUsers,
    updateUser,
    deleteUser,
    searchUsers
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(listUsers, "00fe4727cac8f70f5edc703838dabca6792c690f8e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateUser, "60b4ddf67d2006cf4a29da630db45e4a7a4beda1e4", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteUser, "40b083290b2943a82c9a8c5f73798589e54bbc5ad3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(searchUsers, "40f55f860f5f5c1e2bb377b18c1a0c1620c50320b7", null);
}),
"[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/courseActions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/actions/announcementActions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/actions/userActions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/courseActions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$announcementActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/announcementActions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$userActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/userActions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/courseActions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/actions/announcementActions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/actions/userActions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00721cff8990621339d8f211b753c247a8623d0334",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$announcementActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listAnnouncements"],
    "00c729f0fcb13a9acca85acc69472af5affee8caf1",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listCourses"],
    "00fe4727cac8f70f5edc703838dabca6792c690f8e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$userActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listUsers"],
    "400492345bb78809c3046bc3a072b760be7d685af4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$announcementActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteAnnouncement"],
    "400a05ef8d432a3c4ed68bbb7dc7ea3e67e5767d27",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteLesson"],
    "404001c0ab7c8ec1296d7f0e74492b7cb2781bc127",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listLessons"],
    "409d1156001915a04f18aaeda7086d1c6ae3b5eb26",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listModules"],
    "40b083290b2943a82c9a8c5f73798589e54bbc5ad3",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$userActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteUser"],
    "40cada5192e4898fc97c2bec447f5f0c82920adcbf",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteCourse"],
    "40d3794158f33f10553408babb4643c61f0a01e583",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteModule"],
    "60193bb4f320ace54e465f7c3e29f92ce450ee210d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$announcementActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAnnouncement"],
    "605841422bbcd60441154894f36579b80e85d9fcc3",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["publishCourse"],
    "609d5750ce9eb702195e2c54ba908d22b9c64a6264",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateLesson"],
    "60a56318eb6059efc1f0fdfdb4070a7fdc94305b9b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reorderLessons"],
    "60b20a256cfaf7dc44fb26ead925cb0f33e7c114b3",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createCourse"],
    "60b4ddf67d2006cf4a29da630db45e4a7a4beda1e4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$userActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateUser"],
    "60c099a26d59c66b0d55e0af188374b1d738722fe8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createModule"],
    "60dfb916d99351656b3d40dd5fd4b0b67f331b7ba1",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reorderModules"],
    "7842ffb104e6a18f93868d6ff8498037ad7d65c330",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createLesson"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$announcementActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$userActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/courseActions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/actions/announcementActions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/actions/userActions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$courseActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/courseActions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$announcementActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/announcementActions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$userActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/userActions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_82dace25._.js.map