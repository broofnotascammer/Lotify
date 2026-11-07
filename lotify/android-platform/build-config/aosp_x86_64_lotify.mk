# Product configuration for headless x86-64 Lotify compatibility runtime
# Derived from minimal AOSP generic x86_64 target

PRODUCT_NAME := aosp_x86_64_lotify
PRODUCT_DEVICE := generic_x86_64
PRODUCT_BRAND := Lotify
PRODUCT_MODEL := Lotify Android Compatibility Runtime
PRODUCT_MANUFACTURER := Lotify Project

# Architecture definition: x86-64 pure native execution
TARGET_ARCH := x86_64
TARGET_ARCH_VARIANT := x86_64
TARGET_CPU_ABI := x86_64
TARGET_2ND_ARCH :=
TARGET_2ND_CPU_ABI :=

# Disable emulation and virtualization drivers
BOARD_USE_QEMU := false
BOARD_USES_VIRTIO := false

# Build headless runtime without cellular telephony, camera HAL, or Bluetooth hardware daemon
PRODUCT_PACKAGES += \
    art \
    core-oj \
    core-libart \
    okhttp \
    bouncycastle \
    apache-xml \
    framework-minus-apex \
    linker64 \
    libc \
    libm \
    libdl \
    liblog \
    libbinder \
    servicemanager

# ART Compiler and JIT configuration for Ivy Bridge baseline
PRODUCT_PROPERTY_OVERRIDES += \
    dalvik.vm.dex2oat-filter=speed-profile \
    dalvik.vm.execution-mode=int:jit \
    dalvik.vm.heapgrowthlimit=256m \
    dalvik.vm.heapsize=768m \
    dalvik.vm.isa.x86_64.features=default
