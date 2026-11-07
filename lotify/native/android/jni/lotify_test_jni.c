/**
 * Lotify Test JNI Implementation for Controlled DEX Execution
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Minimal JNI standard types for AOSP ART interoperability
typedef unsigned char jboolean;
typedef signed char jbyte;
typedef unsigned short jchar;
typedef short jshort;
typedef int jint;
typedef long long jlong;
typedef float jfloat;
typedef double jdouble;
typedef void* jobject;
typedef jobject jclass;
typedef jobject jstring;
typedef jobject jthrowable;

struct JNINativeInterface;
typedef const struct JNINativeInterface* JNIEnv;

struct JavaVM;
typedef const struct JNIInvokeInterface* JavaVM;

struct JNINativeInterface {
    void* reserved0;
    void* reserved1;
    void* reserved2;
    void* reserved3;
    jstring (*NewStringUTF)(JNIEnv*, const char*);
    const char* (*GetStringUTFChars)(JNIEnv*, jstring, jboolean*);
    void (*ReleaseStringUTFChars)(JNIEnv*, jstring, const char*);
};

// JNI export: Java_org_lotify_test_HelloLotify_nativeEcho
jstring Java_org_lotify_test_HelloLotify_nativeEcho(JNIEnv* env, jclass clazz, jstring input) {
    if (!env || !(*env)) return NULL;

    const char* str = (*env)->GetStringUTFChars(env, input, NULL);
    char buffer[256];
    snprintf(buffer, sizeof(buffer), "[JNI_HOST_ECHO] %s (x86_64 AOSP ART 14 bridge)", str ? str : "null");

    if (str) {
        (*env)->ReleaseStringUTFChars(env, input, str);
    }

    return (*env)->NewStringUTF(env, buffer);
}
