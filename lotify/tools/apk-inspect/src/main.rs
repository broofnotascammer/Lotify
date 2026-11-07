use lotify_apk::ApkInspector;
use std::env;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: apk-inspect <path-to-apk>");
        std::process::exit(1);
    }

    let apk_path = &args[1];
    println!("Inspecting package: {}", apk_path);

    match ApkInspector::inspect_file(apk_path) {
        Ok(meta) => {
            println!("\n[+] Package: {}", meta.package_name);
            println!("    Version: {} ({})", meta.version_name, meta.version_code);
            println!("    SDK Range: min={} -> target={}", meta.min_sdk, meta.target_sdk);
            println!("    Supported ABIs: {:?}", meta.supported_abis);
            println!("    x86_64 Compatible: {}", if meta.is_x86_64_compatible { "YES" } else { "NO" });
            println!("    Native Shared Libraries ({}): {:?}", meta.native_libraries.len(), meta.native_libraries);
            println!("    DEX Files Count: {}", meta.dex_files_count);
            if !meta.warnings.is_empty() {
                println!("\n[!] Warnings/Issues:");
                for w in meta.warnings {
                    println!("    - {}", w);
                }
            }
        }
        Err(err) => {
            eprintln!("[-] Inspection failed: {}", err);
            std::process::exit(1);
        }
    }

    Ok(())
}
