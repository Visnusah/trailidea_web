"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema, CreatePostFormData } from "@/lib/validations/post";
import { createPost } from "@/lib/api/posts";
import { suggestPostDescription } from "@/lib/api/ai";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import MapPicker from "@/app/_components/MapPicker";

export default function CreatePostPage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI description suggestions
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Map Integration State
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      links: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  const watchedTitle = watch("title");
  const watchedDescription = watch("description");

  // Debounce AI suggestions: fire 800ms after user stops typing in description (min 20 chars)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (watchedDescription && watchedDescription.length >= 20) {
      debounceRef.current = setTimeout(async () => {
        setLoadingAI(true);
        const suggestions = await suggestPostDescription(
          watchedTitle || "Trail Post",
          watchedDescription
        );
        setAiSuggestions(suggestions);
        setLoadingAI(false);
      }, 800);
    } else {
      setAiSuggestions([]);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watchedDescription, watchedTitle]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - selectedFiles.length);
    const validFiles = newFiles.filter((f) =>
      ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"].includes(f.type)
    );

    if (validFiles.length !== newFiles.length) {
      toast.error("Some files were skipped — only images (JPEG, PNG, GIF, WebP) are allowed.");
    }

    const updatedFiles = [...selectedFiles, ...validFiles].slice(0, 5);
    setSelectedFiles(updatedFiles);
    const newPreviews = updatedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedFiles.map((file) => URL.createObjectURL(file)));
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    if (direction === "left" && index === 0) return;
    if (direction === "right" && index === selectedFiles.length - 1) return;

    const targetIndex = direction === "left" ? index - 1 : index + 1;

    const newFiles = [...selectedFiles];
    const tempFile = newFiles[index];
    newFiles[index] = newFiles[targetIndex];
    newFiles[targetIndex] = tempFile;

    const newPreviews = [...previews];
    const tempPreview = newPreviews[index];
    newPreviews[index] = newPreviews[targetIndex];
    newPreviews[targetIndex] = tempPreview;

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const toggleLocation = () => {
    if (isLocationEnabled) {
      setIsLocationEnabled(false);
      setCoordinates(null);
      setPlaceName("");
      return;
    }

    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
          setIsLocationEnabled(true);
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          toast.error("Could not get your location. Please check browser permissions.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  const onSubmit = async (data: CreatePostFormData) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      if (data.subtitle) formData.append("subtitle", data.subtitle);
      formData.append("description", data.description);

      const validLinks = (data.links || [])
        .map((l) => l.value)
        .filter((v) => v && v.trim() !== "");
      if (validLinks.length > 0) {
        formData.append("links", JSON.stringify(validLinks));
      }

      if (isLocationEnabled && coordinates) {
        const mapData = {
          type: "Point",
          coordinates: coordinates,
          placeName: placeName.trim() !== "" ? placeName : undefined,
        };
        formData.append("mapData", JSON.stringify(mapData));
      }

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      await createPost(formData);
      toast.success("Post created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="post-form-page">
      <div className="post-form-container">
        <div className="post-form-header">
          <h1 className="text-headline-md">Create a Post</h1>
          <p className="post-form-header__subtitle">
            Share your trail experience with the community
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="post-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="post-title">
              Title <span className="post-form__required">*</span>
            </label>
            <input
              id="post-title"
              type="text"
              placeholder="Give your post a title..."
              className={`post-form__input ${errors.title ? "post-form__input--error" : ""}`}
              {...register("title")}
            />
            {errors.title && (
              <span className="form-field-error">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Subtitle */}
          <div className="form-group">
            <label className="form-label" htmlFor="post-subtitle">
              Subtitle
            </label>
            <input
              id="post-subtitle"
              type="text"
              placeholder="Optional subtitle or tagline..."
              className="post-form__input"
              {...register("subtitle")}
            />
          </div>

          {/* Description + AI Suggestions */}
          <div className="form-group">
            <label className="form-label" htmlFor="post-description">
              Description <span className="post-form__required">*</span>
            </label>
            <textarea
              id="post-description"
              placeholder="Tell your story... Describe the trail, the experience, tips for others..."
              rows={6}
              className={`post-form__textarea ${errors.description ? "post-form__input--error" : ""}`}
              {...register("description")}
            />
            {errors.description && (
              <span className="form-field-error">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                {errors.description.message}
              </span>
            )}

            {/* AI Description Suggestions */}
            {(loadingAI || aiSuggestions.length > 0) && (
              <div className="ai-suggestions-box">
                <div className="ai-suggestions-header">
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-primary)" }}>
                    auto_awesome
                  </span>
                  <span>AI Description Suggestions</span>
                  {loadingAI && (
                    <span className="material-symbols-outlined" style={{ fontSize: 16, animation: "spin 1s linear infinite" }}>
                      progress_activity
                    </span>
                  )}
                </div>
                {!loadingAI &&
                  aiSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      className="ai-suggestion-card"
                      onClick={() => {
                        setValue("description", suggestion, { shouldValidate: true });
                        setAiSuggestions([]);
                      }}
                    >
                      <span className="ai-suggestion-number">{i + 1}</span>
                      <span className="ai-suggestion-text">{suggestion}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">
              Images
              <span className="post-form__hint"> (up to 5 images, max 5MB each)</span>
            </label>
            <div
              className={`post-form__dropzone ${dragActive ? "post-form__dropzone--active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 40, color: "var(--color-outline)" }}
              >
                add_photo_alternate
              </span>
              <p className="post-form__dropzone-text">
                Drag & drop images here, or <span>click to browse</span>
              </p>
              <p className="post-form__dropzone-hint">JPEG, PNG, GIF, WebP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>

            {previews.length > 0 && (
              <div className="reorder-container">
                {previews.map((src, i) => (
                  <div key={i} className="reorder-item">
                    <img src={src} alt={`Preview ${i + 1}`} />
                    <div className="reorder-item__controls">
                      <button
                        type="button"
                        className="reorder-item__btn"
                        onClick={() => moveImage(i, "left")}
                        disabled={i === 0}
                        title="Move Left"
                      >
                        <span className="material-symbols-outlined">arrow_back</span>
                      </button>
                      <button
                        type="button"
                        className="reorder-item__btn"
                        onClick={() => removeImage(i)}
                        title="Remove Image"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                      <button
                        type="button"
                        className="reorder-item__btn"
                        onClick={() => moveImage(i, "right")}
                        disabled={i === previews.length - 1}
                        title="Move Right"
                      >
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="form-group">
            <label className="form-label">External Links</label>
            {fields.map((field, index) => (
              <div key={field.id} className="post-form__link-row">
                <input
                  type="url"
                  placeholder="https://example.com"
                  className={`post-form__input ${errors.links?.[index]?.value ? "post-form__input--error" : ""}`}
                  {...register(`links.${index}.value`)}
                />
                <button
                  type="button"
                  className="post-form__link-remove"
                  onClick={() => remove(index)}
                  aria-label="Remove link"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    delete
                  </span>
                </button>
              </div>
            ))}
            <button
              type="button"
              className="post-form__add-link"
              onClick={() => append({ value: "" })}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                add
              </span>
              Add Link
            </button>
          </div>

          {/* Map Integration */}
          <div className="form-group">
            <div className="form-group__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Location Tag</label>
              <button
                type="button"
                onClick={toggleLocation}
                disabled={isLocating}
                className="btn-outline-small"
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px", borderRadius: "100px",
                  border: `1px solid ${isLocationEnabled ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                  background: isLocationEnabled ? "var(--color-primary-container)" : "transparent",
                  color: isLocationEnabled ? "var(--color-on-primary-container)" : "var(--color-on-surface)",
                  cursor: "pointer", fontSize: "13px", fontWeight: "600"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  {isLocating ? "sync" : (isLocationEnabled ? "location_on" : "location_off")}
                </span>
                {isLocating ? "Locating..." : (isLocationEnabled ? "Location Enabled" : "Enable Location")}
              </button>
            </div>

            {isLocationEnabled && coordinates ? (
              <div className="post-form__map-container" style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--color-outline-variant)", borderRadius: "12px", padding: "12px" }}>
                <input
                  type="text"
                  placeholder="Name this place (e.g., Everest Base Camp, Nepal)"
                  className="post-form__input"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                />
                <div style={{ height: "300px", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
                  <MapPicker
                    position={[coordinates[1], coordinates[0]]}
                    onPositionChange={(lat, lng) => setCoordinates([lng, lat])}
                    onPlaceNameChange={(name) => setPlaceName(name)}
                  />
                </div>
                <p className="post-form__hint" style={{ margin: 0, textAlign: "center" }}>
                  Click anywhere on the map to move the pin.
                </p>
              </div>
            ) : (
              <div className="post-form__map-placeholder" style={{
                padding: "24px",
                border: "1px dashed var(--color-outline-variant)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: "var(--color-surface-container-lowest)"
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-outline)" }}>map</span>
                <div>
                  <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "var(--color-on-surface)" }}>Add Location to Post</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--color-on-surface-variant)" }}>
                    Enable location to tag where your trail is located on the map.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="post-form__submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20, animation: "spin 1s linear infinite" }}
                >
                  progress_activity
                </span>
                Publishing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  send
                </span>
                Publish Post
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
