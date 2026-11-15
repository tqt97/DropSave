use std::path::PathBuf;
use tauri_plugin_opener::OpenerExt;

const ALLOWED_EXTENSIONS: [&str; 2] = ["mp4", "mp3"];

fn safe_output_path(output_directory: &str, filename: &str, extension: &str) -> Result<PathBuf, String> {
    if filename.trim().is_empty() {
        return Err("Filename cannot be empty.".into());
    }

    if filename.contains('/') || filename.contains('\\') || filename == "." || filename == ".." {
        return Err("Filename contains an invalid path separator.".into());
    }

    if !ALLOWED_EXTENSIONS.contains(&extension) {
        return Err("Unsupported output extension.".into());
    }

    let directory = PathBuf::from(output_directory);
    if !directory.is_dir() {
        return Err("Output directory does not exist.".into());
    }

    Ok(directory.join(format!("{filename}.{extension}")))
}

#[tauri::command]
fn ffmpeg_path() -> Result<String, String> {
    let current_exe = std::env::current_exe().map_err(|error| error.to_string())?;
    let binary_name = if cfg!(target_os = "windows") { "ffmpeg.exe" } else { "ffmpeg" };
    let path = current_exe.with_file_name(binary_name);

    if !path.exists() {
        return Err(format!("FFmpeg sidecar not found at {}", path.display()));
    }

    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
fn output_file_path(output_directory: String, filename: String, extension: String) -> Result<String, String> {
    let path = safe_output_path(&output_directory, &filename, &extension)?;
    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
fn output_file_exists(output_directory: String, filename: String, extension: String) -> Result<bool, String> {
    Ok(safe_output_path(&output_directory, &filename, &extension)?.exists())
}

#[tauri::command]
fn reveal_output_file(
    app: tauri::AppHandle,
    output_directory: String,
    filename: String,
    extension: String,
) -> Result<(), String> {
    let path = safe_output_path(&output_directory, &filename, &extension)?;
    if !path.is_file() {
        return Err("Downloaded file no longer exists.".into());
    }

    app.opener()
        .reveal_item_in_dir(path)
        .map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            ffmpeg_path,
            output_file_path,
            output_file_exists,
            reveal_output_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running DropSave");
}
